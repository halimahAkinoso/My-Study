import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../../components/DashboardCard";
import ProgressChart from "../../components/ProgressChart";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getStudyPreferences } from "../../utils/studyPreferences";
import { summarizeStudyProgress } from "../../utils/studyProgress";

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Progress() {
  const navigate = useNavigate();
  const summary = summarizeStudyProgress();
  const preferences = getStudyPreferences();

  const weeklyActivityScore = useMemo(() => {
    return summary.chartData.values.reduce((total, value) => total + value, 0);
  }, [summary.chartData.values]);

  const weeklyGoalProgress = Math.min(
    100,
    preferences.weeklyStudyGoal > 0
      ? Math.round((weeklyActivityScore / preferences.weeklyStudyGoal) * 100)
      : 0
  );

  const hasProgress =
    summary.lessonsStarted > 0 ||
    summary.quizzesCompleted > 0 ||
    summary.tutorSessions.length > 0;

  return (
    <DashboardLayout>
      <div>
        <h1
          style={{
            color: "#1E40AF",
            marginBottom: "10px",
          }}
        >
          Learning Progress
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "30px",
          }}
        >
          Track your recent study activity, quiz performance, and weekly momentum.
        </p>

        {!hasProgress && (
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1E3A8A",
              padding: "20px",
              borderRadius: "16px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              No progress recorded yet
            </h3>

            <p
              style={{
                marginBottom: "16px",
              }}
            >
              Open a lesson, finish a quiz, or use the AI Tutor and your progress will start appearing here.
            </p>

            <button
              onClick={() => navigate("/subjects")}
              style={{
                border: "none",
                background: "#2563EB",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Browse Subjects
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <DashboardCard
            title="Lessons Started"
            value={String(summary.lessonsStarted)}
            color="#2563EB"
          />
          <DashboardCard
            title="Quizzes Completed"
            value={String(summary.quizzesCompleted)}
            color="#16A34A"
          />
          <DashboardCard
            title="Quiz Average"
            value={`${summary.averageScore}%`}
            color="#EA580C"
          />
          <DashboardCard
            title="Current Streak"
            value={`${summary.streak} day${summary.streak === 1 ? "" : "s"}`}
            color="#7C3AED"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              7-Day Activity
            </h2>

            <p
              style={{
                color: "#6B7280",
                marginBottom: "20px",
              }}
            >
              Lessons and tutor sessions add 1 point. Completed quizzes add 2 points.
            </p>

            <ProgressChart
              labels={summary.chartData.labels}
              values={summary.chartData.values}
            />
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Weekly Goal
            </h2>

            <p
              style={{
                color: "#6B7280",
                marginBottom: "10px",
              }}
            >
              Goal: {preferences.weeklyStudyGoal} activity point
              {preferences.weeklyStudyGoal === 1 ? "" : "s"} this week
            </p>

            <div
              style={{
                background: "#E2E8F0",
                height: "14px",
                borderRadius: "999px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: `${weeklyGoalProgress}%`,
                  background: "linear-gradient(90deg, #2563EB 0%, #16A34A 100%)",
                  height: "100%",
                }}
              />
            </div>

            <h3
              style={{
                color: "#0F172A",
                marginBottom: "8px",
              }}
            >
              {weeklyActivityScore} / {preferences.weeklyStudyGoal}
            </h3>

            <p
              style={{
                color: "#475569",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {weeklyGoalProgress >= 100
                ? "You have hit your goal for the week. Keep the momentum going."
                : `You are ${Math.max(
                    preferences.weeklyStudyGoal - weeklyActivityScore,
                    0
                  )} point${preferences.weeklyStudyGoal - weeklyActivityScore === 1 ? "" : "s"} away from your weekly goal.`}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Recent Lessons
            </h2>

            {summary.recentLessons.length === 0 ? (
              <p style={{ color: "#6B7280" }}>No lesson activity yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {summary.recentLessons.map((lesson) => (
                  <div
                    key={lesson.topicId}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "14px",
                      padding: "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 6px",
                        color: "#0F172A",
                      }}
                    >
                      {lesson.title}
                    </h3>

                    <p
                      style={{
                        color: "#64748B",
                        margin: "0 0 10px",
                      }}
                    >
                      {lesson.subjectName || "Independent Study"} • {lesson.visits} visit
                      {lesson.visits === 1 ? "" : "s"}
                    </p>

                    <p
                      style={{
                        color: "#475569",
                        margin: "0 0 12px",
                        lineHeight: 1.6,
                      }}
                    >
                      Last opened {formatDateTime(lesson.lastOpenedAt)}
                    </p>

                    <button
                      onClick={() => navigate(`/lesson/${lesson.topicId}`)}
                      style={{
                        border: "none",
                        background: "#2563EB",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Continue Lesson
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Recent Quiz Results
            </h2>

            {summary.recentQuizzes.length === 0 ? (
              <p style={{ color: "#6B7280" }}>No completed quizzes yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {summary.recentQuizzes.map((quiz, index) => (
                  <div
                    key={`${quiz.topicId}-${quiz.completedAt}-${index}`}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "14px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: "#0F172A",
                        }}
                      >
                        {quiz.title}
                      </h3>

                      <span
                        style={{
                          background:
                            quiz.percentage >= 50 ? "#DCFCE7" : "#FEE2E2",
                          color:
                            quiz.percentage >= 50 ? "#166534" : "#B91C1C",
                          borderRadius: "999px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {quiz.percentage}%
                      </span>
                    </div>

                    <p
                      style={{
                        color: "#64748B",
                        margin: "10px 0",
                      }}
                    >
                      {quiz.score} / {quiz.totalQuestions} correct • {formatDateTime(quiz.completedAt)}
                    </p>

                    <button
                      onClick={() => navigate(`/quiz/${quiz.topicId}`)}
                      style={{
                        border: "none",
                        background: "#16A34A",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Retake Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 5px 18px rgba(15, 23, 42, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1E3A8A",
              }}
            >
              Top Subjects
            </h2>

            {summary.topSubjects.length === 0 ? (
              <p style={{ color: "#6B7280" }}>Study a few lessons to see your strongest activity areas.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {summary.topSubjects.map((subject) => (
                  <div
                    key={subject.subjectName}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #E2E8F0",
                      borderRadius: "14px",
                      padding: "14px 16px",
                    }}
                  >
                    <span
                      style={{
                        color: "#0F172A",
                        fontWeight: 600,
                      }}
                    >
                      {subject.subjectName}
                    </span>

                    <span
                      style={{
                        color: "#2563EB",
                        fontWeight: 700,
                      }}
                    >
                      {subject.visits} visit{subject.visits === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Progress;
