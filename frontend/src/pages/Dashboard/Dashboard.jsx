import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import DashboardCard from "../../components/DashboardCard";
import ProgressChart from "../../components/ProgressChart";
import RecommendationCard from "../../components/RecommendationCard";
import { useAuth } from "../../context/AuthContext";
import { getSubjects } from "../../services/subjectService";
import { getStudyPreferences } from "../../utils/studyPreferences";
import {
  DASHBOARD_SUBJECTS_CACHE_KEY,
  LAST_ACTIVE_LESSON_KEY,
  LAST_ACTIVE_SUBJECT_KEY,
  readStoredItem,
  writeStoredItem,
} from "../../utils/dashboardStorage";
import { summarizeStudyProgress } from "../../utils/studyProgress";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState(() =>
    readStoredItem(DASHBOARD_SUBJECTS_CACHE_KEY, [])
  );
  const [recentSubject, setRecentSubject] = useState(() =>
    readStoredItem(LAST_ACTIVE_SUBJECT_KEY)
  );
  const [recentLesson, setRecentLesson] = useState(() =>
    readStoredItem(LAST_ACTIVE_LESSON_KEY)
  );
  const [loading, setLoading] = useState(subjects.length === 0);
  const [error, setError] = useState("");
  const preferences = getStudyPreferences();
  const progressSummary = summarizeStudyProgress();

  useEffect(() => {
    setRecentSubject(readStoredItem(LAST_ACTIVE_SUBJECT_KEY));
    setRecentLesson(readStoredItem(LAST_ACTIVE_LESSON_KEY));
    loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    setError("");

    try {
      const data = await getSubjects();
      setSubjects(data);
      writeStoredItem(DASHBOARD_SUBJECTS_CACHE_KEY, data);
    } catch (loadError) {
      const cachedSubjects = readStoredItem(
        DASHBOARD_SUBJECTS_CACHE_KEY,
        []
      );

      setSubjects(cachedSubjects);
      setError(
        cachedSubjects.length
          ? "We couldn't refresh your subjects just now, so we're showing your last saved dashboard content."
          : "We couldn't load your dashboard content. Please try again."
      );
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenSubject(subject) {
    const storedSubject = {
      id: subject.id,
      name: subject.name,
      updatedAt: new Date().toISOString(),
    };

    writeStoredItem(LAST_ACTIVE_SUBJECT_KEY, storedSubject);
    setRecentSubject(storedSubject);
    navigate(`/subjects/${subject.id}`);
  }

  function handleOpenLesson() {
    if (!recentLesson?.topicId) {
      return;
    }

    navigate(`/lesson/${recentLesson.topicId}`);
  }

  const firstName = user?.name?.trim()?.split(" ")[0] || "Learner";

  return (
    <DashboardLayout>
      <div>
        <h1
          style={{
            marginBottom: "5px",
            color: "#1E3A8A",
          }}
        >
          Welcome back, {firstName}
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "30px",
          }}
        >
          Continue your personalized learning journey.
        </p>

        {error && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              background: "#FEF3C7",
              color: "#92400E",
              padding: "16px 18px",
              borderRadius: "14px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            <span>{error}</span>

            <button
              onClick={loadSubjects}
              style={{
                border: "none",
                background: "#D97706",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {(recentLesson || recentSubject) && (
          <>
            <h2>Resume Learning</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {recentLesson && (
                <div
                  style={{
                    background: "#EFF6FF",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #BFDBFE",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px",
                      color: "#2563EB",
                      fontWeight: 700,
                    }}
                  >
                    Last Lesson
                  </p>

                  <h3
                    style={{
                      margin: "0 0 10px",
                      color: "#1E3A8A",
                    }}
                  >
                    {recentLesson.title}
                  </h3>

                  <p
                    style={{
                      color: "#475569",
                      minHeight: "48px",
                    }}
                  >
                    {recentLesson.description ||
                      "Jump back into your saved lesson content."}
                  </p>

                  <button
                    onClick={handleOpenLesson}
                    style={{
                      marginTop: "12px",
                      background: "#2563EB",
                      color: "#fff",
                      border: "none",
                      padding: "12px 18px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {recentSubject && (
                <div
                  style={{
                    background: "#F0FDF4",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px",
                      color: "#15803D",
                      fontWeight: 700,
                    }}
                  >
                    Last Subject
                  </p>

                  <h3
                    style={{
                      margin: "0 0 10px",
                      color: "#166534",
                    }}
                  >
                    {recentSubject.name}
                  </h3>

                  <p
                    style={{
                      color: "#3F3F46",
                      minHeight: "48px",
                    }}
                  >
                    Reopen this subject and keep working through its topics
                    and lessons.
                  </p>

                  <button
                    onClick={() => navigate(`/subjects/${recentSubject.id}`)}
                    style={{
                      marginTop: "12px",
                      background: "#16A34A",
                      color: "#fff",
                      border: "none",
                      padding: "12px 18px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Open Subject
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          <DashboardCard
            title="Lessons Started"
            value={String(progressSummary.lessonsStarted)}
            color="#2563EB"
          />

          <DashboardCard
            title="Quiz Average"
            value={`${progressSummary.averageScore}%`}
            color="#16A34A"
          />

          <DashboardCard
            title="Study Days"
            value={String(progressSummary.activeDays)}
            color="#EA580C"
          />

          <DashboardCard
            title="Current Streak"
            value={`${progressSummary.streak} Day${progressSummary.streak === 1 ? "" : "s"}`}
            color="#9333EA"
          />
        </div>

        <br />

        <h2>Learning Progress</h2>

        <ProgressChart
          labels={progressSummary.chartData.labels}
          values={progressSummary.chartData.values}
        />

        <br />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <h2>Continue Learning</h2>

          <button
            onClick={() => navigate("/subjects")}
            style={{
              background: "#2563EB",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            View All
          </button>
        </div>

        {loading && subjects.length === 0 ? (
          <h3>Loading subjects...</h3>
        ) : subjects.length === 0 ? (
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              padding: "22px",
              borderRadius: "14px",
              color: "#475569",
            }}
          >
            No subjects are available yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: "20px",
            }}
          >
            {subjects.slice(0, 6).map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleOpenSubject(subject)}
                style={{
                  background: "#fff",
                  padding: "25px",
                  borderRadius: "15px",
                  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
                  cursor: "pointer",
                  transition: ".3s",
                }}
              >
                <h3
                  style={{
                    color: "#1E40AF",
                  }}
                >
                  {subject.name}
                </h3>

                <p
                  style={{
                    color: "#6B7280",
                  }}
                >
                  Explore lessons, quizzes and AI tutoring.
                </p>

                <button
                  style={{
                    marginTop: "15px",
                    background: "#2563EB",
                    color: "#fff",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Open Subject
                </button>
              </div>
            ))}
          </div>
        )}

        <br />

        {preferences.showStudyRecommendations && (
          <>
            <h2>AI Recommendations</h2>

            <RecommendationCard
              text={
                recentLesson?.title
                  ? `Continue ${recentLesson.title}.`
                  : "Open a lesson and continue where you left off."
              }
            />
            <RecommendationCard
              text={
                progressSummary.recentQuizzes[0]
                  ? `Retake ${progressSummary.recentQuizzes[0].title} to improve your ${progressSummary.recentQuizzes[0].percentage}% score.`
                  : "Complete a quiz after your next lesson to start tracking performance."
              }
            />
            <RecommendationCard
              text={
                progressSummary.topSubjects[0]
                  ? `You are most active in ${progressSummary.topSubjects[0].subjectName}. Build momentum there today.`
                  : "Study at least one topic today to build your learning streak."
              }
            />
            <RecommendationCard text="Ask the AI Tutor to explain any part you still find difficult." />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
