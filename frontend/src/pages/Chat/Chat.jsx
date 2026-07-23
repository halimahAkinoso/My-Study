import { useEffect, useState } from "react";
import { FaArrowRight, FaBookOpen, FaComments, FaLightbulb } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getLesson } from "../../services/lessonService";
import { sendTutorMessage } from "../../services/tutorService";
import { recordTutorSession } from "../../utils/studyProgress";
import {
  LAST_ACTIVE_LESSON_KEY,
  readStoredItem,
  writeStoredItem,
} from "../../utils/dashboardStorage";

function createWelcomeMessage(userName, lesson) {
  if (!lesson?.topicId) {
    return {
      id: "welcome-empty",
      role: "assistant",
      content:
        `Hello ${userName || "there"}. Open a lesson first, then come back here and I will explain the topic, give worked examples, and help you revise for the quiz.`,
    };
  }

  return {
    id: `welcome-${lesson.topicId}`,
    role: "assistant",
    content:
      `Hello ${userName || "there"}. I am ready to help you study **${lesson.title}**${lesson.subjectName ? ` in ${lesson.subjectName}` : ""}.\n\nAsk me to explain the topic, break down a difficult part, create practice questions, or summarize it for revision.`,
  };
}

function buildStarterPrompts(lesson) {
  const topicLabel = lesson?.title || "this lesson";

  return [
    `Explain ${topicLabel} in simple terms.`,
    `Give me a worked example on ${topicLabel}.`,
    `Ask me 3 quiz questions on ${topicLabel}.`,
    `Summarize ${topicLabel} for revision.`,
  ];
}

function cleanLessonPreview(notes) {
  return notes
    ?.replace(/<!--.*?-->/g, "")
    ?.replace(/[#*_>`-]/g, " ")
    ?.replace(/\s+/g, " ")
    ?.trim()
    ?.slice(0, 180);
}

function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [activeLesson, setActiveLesson] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [composer, setComposer] = useState("");
  const [loadingContext, setLoadingContext] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initializeTutor();
  }, [searchParams.toString(), user?.name]);

  async function initializeTutor() {
    setLoadingContext(true);
    setError("");

    const storedLesson = readStoredItem(LAST_ACTIVE_LESSON_KEY, null);
    const queryTopicId = Number(searchParams.get("topicId")) || null;
    const baseLesson =
      queryTopicId && storedLesson?.topicId !== queryTopicId
        ? {
            topicId: queryTopicId,
            title: "Current lesson",
            description: "",
            subjectName: storedLesson?.subjectName || "",
          }
        : storedLesson;

    setActiveLesson(baseLesson);
    setSuggestions(buildStarterPrompts(baseLesson));
    setMessages([createWelcomeMessage(user?.name, baseLesson)]);

    if (!queryTopicId && !storedLesson?.topicId) {
      setLoadingContext(false);
      return;
    }

    const topicId = queryTopicId || storedLesson?.topicId;

    try {
      const lesson = await getLesson(topicId);
      const hydratedLesson = {
        topicId,
        title: lesson.title,
        description:
          cleanLessonPreview(lesson.notes) ||
          baseLesson?.description ||
          "Ask the tutor to teach this lesson step by step.",
        subjectName: baseLesson?.subjectName || "",
        updatedAt: new Date().toISOString(),
      };

      setActiveLesson(hydratedLesson);
      setSuggestions(buildStarterPrompts(hydratedLesson));
      setMessages([createWelcomeMessage(user?.name, hydratedLesson)]);
      writeStoredItem(LAST_ACTIVE_LESSON_KEY, hydratedLesson);
    } catch (loadError) {
      console.error(loadError);
      setError("We could not load the current lesson context. You can still open a lesson and try again.");
    } finally {
      setLoadingContext(false);
    }
  }

  async function handleSendMessage(prefilledMessage = "") {
    const outgoingMessage = (prefilledMessage || composer).trim();

    if (!outgoingMessage || sending) {
      return;
    }

    if (!activeLesson?.topicId) {
      setError("Open a lesson first so the tutor knows what topic you are studying.");
      return;
    }

    const nextMessages = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: outgoingMessage,
      },
    ];

    setMessages(nextMessages);
    setComposer("");
    setSending(true);
    setError("");

    try {
      const response = await sendTutorMessage({
        topic_id: activeLesson.topicId,
        message: outgoingMessage,
        history: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      setMessages([
        ...nextMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.reply,
        },
      ]);
      setSuggestions(
        response.follow_up_questions?.length
          ? response.follow_up_questions
          : buildStarterPrompts(activeLesson)
      );
      recordTutorSession({
        topicId: activeLesson.topicId,
        title: activeLesson.title,
        subjectName: activeLesson.subjectName || "",
        prompt: outgoingMessage,
      });
    } catch (sendError) {
      console.error(sendError);
      setError(
        sendError.response?.data?.detail ||
          "The tutor could not respond right now. Please try again in a moment."
      );
      setMessages(nextMessages);
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <DashboardLayout>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <aside
          style={{
            alignSelf: "start",
            background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)",
            border: "1px solid #DBEAFE",
            borderRadius: "20px",
            padding: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#2563EB",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaComments />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#1E3A8A",
                }}
              >
                AI Tutor
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748B",
                  lineHeight: 1.5,
                }}
              >
                Topic-based explanations, revision help, and guided practice.
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              padding: "18px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#1D4ED8",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              <FaBookOpen />
              Current Study Context
            </div>

            {loadingContext ? (
              <p style={{ color: "#64748B", margin: 0 }}>Loading lesson context...</p>
            ) : activeLesson?.topicId ? (
              <>
                <h3
                  style={{
                    margin: "0 0 8px",
                    color: "#0F172A",
                  }}
                >
                  {activeLesson.title}
                </h3>

                {activeLesson.subjectName && (
                  <div
                    style={{
                      display: "inline-block",
                      background: "#DBEAFE",
                      color: "#1D4ED8",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    {activeLesson.subjectName}
                  </div>
                )}

                <p
                  style={{
                    margin: 0,
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  {activeLesson.description || "Ask the tutor to explain this lesson in more detail."}
                </p>
              </>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                No lesson is active yet. Open a lesson from Subjects or Topics so the tutor can answer from the correct material.
              </p>
            )}
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#1E3A8A",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              <FaLightbulb />
              Good Prompts
            </div>

            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={sending || !activeLesson?.topicId}
                  style={{
                    textAlign: "left",
                    border: "1px solid #BFDBFE",
                    background: sending || !activeLesson?.topicId ? "#F8FAFC" : "#EFF6FF",
                    color: "#1D4ED8",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    cursor: sending || !activeLesson?.topicId ? "not-allowed" : "pointer",
                    lineHeight: 1.5,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "12px",
              marginTop: "18px",
            }}
          >
            <button
              onClick={() =>
                activeLesson?.topicId
                  ? navigate(`/lesson/${activeLesson.topicId}`)
                  : navigate("/topics")
              }
              style={{
                border: "none",
                background: "#2563EB",
                color: "#fff",
                padding: "13px 16px",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {activeLesson?.topicId ? "Open Current Lesson" : "Browse Topics"}
            </button>

            {activeLesson?.topicId && (
              <button
                onClick={() => navigate(`/quiz/${activeLesson.topicId}`)}
                style={{
                  border: "1px solid #CBD5E1",
                  background: "#fff",
                  color: "#0F172A",
                  padding: "13px 16px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Take Topic Quiz
              </button>
            )}
          </div>
        </aside>

        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "22px",
            minHeight: "72vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 24px",
              borderBottom: "1px solid #E2E8F0",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
            }}
          >
            <h1
              style={{
                margin: "0 0 8px",
                color: "#0F172A",
                fontSize: "28px",
              }}
            >
              Learn with your AI Tutor
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              Ask for explanations, step-by-step teaching, revision summaries, or practice on the topic you are currently studying.
            </p>
          </div>

          {error && (
            <div
              style={{
                margin: "18px 24px 0",
                background: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              flex: 1,
              padding: "24px",
              overflowY: "auto",
              display: "grid",
              gap: "16px",
              background: "#F8FAFC",
            }}
          >
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";

              return (
                <div
                  key={message.id}
                  style={{
                    justifySelf: isAssistant ? "stretch" : "end",
                    maxWidth: isAssistant ? "100%" : "80%",
                    background: isAssistant ? "#FFFFFF" : "#2563EB",
                    color: isAssistant ? "#0F172A" : "#FFFFFF",
                    border: isAssistant ? "1px solid #E2E8F0" : "none",
                    borderRadius: isAssistant ? "18px 18px 18px 6px" : "18px 18px 6px 18px",
                    padding: "16px 18px",
                    boxShadow: isAssistant ? "0 6px 20px rgba(15, 23, 42, 0.06)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: isAssistant ? "#2563EB" : "#DBEAFE",
                      marginBottom: "10px",
                    }}
                  >
                    {isAssistant ? "Tutor" : "You"}
                  </div>

                  <div
                    style={{
                      lineHeight: 1.8,
                    }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "18px 18px 18px 6px",
                  padding: "16px 18px",
                  color: "#475569",
                  width: "fit-content",
                }}
              >
                The tutor is preparing your explanation...
              </div>
            )}
          </div>

          <div
            style={{
              padding: "18px 24px 24px",
              borderTop: "1px solid #E2E8F0",
              background: "#FFFFFF",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={
                  activeLesson?.topicId
                    ? "Ask the tutor to explain, summarize, or quiz you on this lesson..."
                    : "Open a lesson first, then ask your question here..."
                }
                disabled={sending}
                rows={4}
                style={{
                  flex: 1,
                  border: "1px solid #CBD5E1",
                  borderRadius: "16px",
                  padding: "14px 16px",
                  resize: "vertical",
                  outline: "none",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  minHeight: "96px",
                }}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={sending || !composer.trim() || !activeLesson?.topicId}
                style={{
                  border: "none",
                  background:
                    sending || !composer.trim() || !activeLesson?.topicId
                      ? "#93C5FD"
                      : "#2563EB",
                  color: "#fff",
                  minWidth: "150px",
                  padding: "16px 18px",
                  borderRadius: "16px",
                  cursor:
                    sending || !composer.trim() || !activeLesson?.topicId
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                Send
                <FaArrowRight />
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Chat;
