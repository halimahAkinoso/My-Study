import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getLesson } from "../../services/lessonService";
import { recordLessonVisit } from "../../utils/studyProgress";
import {
  LAST_ACTIVE_LESSON_KEY,
  readStoredItem,
  writeStoredItem,
} from "../../utils/dashboardStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Lesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLesson();
  }, [topicId]);

  function resolveAssetUrl(url) {
    if (!url) {
      return "";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `${API_BASE_URL}${url}`;
  }

  const resolvedPdfUrl = resolveAssetUrl(lesson?.pdf_url);
  const isEmbeddableVideo =
    lesson?.video_url?.includes("youtube.com/embed/") ||
    lesson?.video_url?.includes("youtube-nocookie.com/embed/");
  const youtubeWatchUrl = lesson?.video_url?.includes("/embed/")
    ? lesson.video_url.replace("/embed/", "/watch?v=")
    : lesson?.video_url;

  async function loadLesson() {
    setLoading(true);
    setError("");

    try {
      const data = await getLesson(topicId);
      setLesson(data);

      if (data) {
        const existingLesson = readStoredItem(LAST_ACTIVE_LESSON_KEY, {});
        const nextStoredLesson = {
          ...existingLesson,
          topicId: Number(topicId),
          title: data.title,
          description:
            data.notes?.replace(/[#*_>`-]/g, " ").trim().slice(0, 120) ||
            existingLesson.description ||
            "Jump back into your saved lesson.",
          updatedAt: new Date().toISOString(),
        };

        writeStoredItem(LAST_ACTIVE_LESSON_KEY, nextStoredLesson);
        recordLessonVisit(nextStoredLesson);
      }
    } catch (loadError) {
      setError("We couldn't load this lesson right now. Please try again.");
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading lesson...</h2>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div
          style={{
            background: "#FEE2E2",
            padding: "30px",
            borderRadius: "15px",
            color: "#B91C1C",
          }}
        >
          <h2>Lesson unavailable</h2>
          <p>{error}</p>

          <button
            onClick={loadLesson}
            style={{
              marginTop: "12px",
              border: "none",
              background: "#DC2626",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout>
        <div
          style={{
            background: "#FEF3C7",
            padding: "30px",
            borderRadius: "15px",
          }}
        >
          <h2>No lesson available.</h2>
          <p>This topic does not have lesson content yet.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate(-1)}
        style={{
          border: "none",
          background: "#2563EB",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: "10px",
          cursor: "pointer",
          marginBottom: "25px",
        }}
      >
        Back
      </button>

      <h1
        style={{
          color: "#1E40AF",
        }}
      >
        {lesson.title}
      </h1>

      <p
        style={{
          color: "#6B7280",
          marginBottom: "35px",
        }}
      >
        Learn the topic before attempting the AI Quiz.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => navigate(`/chat?topicId=${topicId}`)}
          style={{
            border: "none",
            background: "#0F766E",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Ask AI Tutor About This Lesson
        </button>

        <button
          onClick={() => navigate(`/quiz/${topicId}`)}
          style={{
            border: "1px solid #BFDBFE",
            background: "#EFF6FF",
            color: "#1D4ED8",
            padding: "12px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Practice with Quiz
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "15px",
          marginBottom: "30px",
          boxShadow: "0 5px 15px rgba(0,0,0,.08)",
        }}
      >
        <h2>Lesson Notes</h2>

        <div
          style={{
            lineHeight: "1.8",
            color: "#374151",
          }}
        >
          <ReactMarkdown>{lesson.notes}</ReactMarkdown>
        </div>
      </div>

      {lesson.image_url && (
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            marginBottom: "30px",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h2>Lesson Illustration</h2>

          <img
            src={lesson.image_url}
            alt={lesson.title}
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>
      )}

      {lesson.video_url && (
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            marginBottom: "30px",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h2>Watch Video</h2>

          {isEmbeddableVideo ? (
            <>
              <iframe
                width="100%"
                height="500"
                src={lesson.video_url}
                title="Lesson Video"
                allowFullScreen
                style={{
                  border: "none",
                  borderRadius: "10px",
                }}
              />

              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "14px",
                  color: "#2563EB",
                  fontWeight: 600,
                }}
              >
                Open this lesson on YouTube
              </a>
            </>
          ) : (
            <a
              href={lesson.video_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                background: "#FF0000",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              Search this lesson on YouTube
            </a>
          )}
        </div>
      )}

      {lesson.pdf_url && (
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            marginBottom: "30px",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h2>PDF Resource</h2>

          <a
            href={resolvedPdfUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              background: "#16A34A",
              color: "#fff",
              textDecoration: "none",
              padding: "12px 20px",
              borderRadius: "10px",
            }}
          >
            Download PDF
          </a>
        </div>
      )}

      <div
        style={{
          background: "#DBEAFE",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
        }}
      >
        <h2>Ready to test yourself?</h2>

        <p>Complete a 20-question AI-powered quiz based on this lesson.</p>

        <button
          onClick={() => navigate(`/quiz/${topicId}`)}
          style={{
            background: "#2563EB",
            color: "#fff",
            border: "none",
            padding: "15px 35px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Start AI Quiz
        </button>
      </div>
    </DashboardLayout>
  );
}

export default Lesson;
