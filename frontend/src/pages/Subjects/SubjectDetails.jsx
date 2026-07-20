import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import { getSubject } from "../../services/subjectService";
import { getTopics } from "../../services/topicService";
import {
  LAST_ACTIVE_LESSON_KEY,
  LAST_ACTIVE_SUBJECT_KEY,
  writeStoredItem,
} from "../../utils/dashboardStorage";

function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [subjectData, topicData] = await Promise.all([
        getSubject(id),
        getTopics(id),
      ]);

      setSubject(subjectData);
      setTopics(topicData);

      writeStoredItem(LAST_ACTIVE_SUBJECT_KEY, {
        id: subjectData.id,
        name: subjectData.name,
        updatedAt: new Date().toISOString(),
      });
    } catch (loadError) {
      setError("We couldn't load this subject right now. Please try again.");
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenLesson(topic) {
    writeStoredItem(LAST_ACTIVE_LESSON_KEY, {
      topicId: topic.id,
      title: topic.title,
      description: topic.description,
      subjectName: subject?.name || "",
      updatedAt: new Date().toISOString(),
    });

    navigate(`/lesson/${topic.id}`);
  }

  return (
    <DashboardLayout>
      <div>
        <button
          onClick={() => navigate("/subjects")}
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
          Back to Subjects
        </button>

        <h1
          style={{
            color: "#1E40AF",
            marginBottom: "10px",
          }}
        >
          {subject?.name || "Subject Details"}
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "35px",
          }}
        >
          Select a topic below to start learning.
        </p>

        {error && (
          <div
            style={{
              background: "#FEE2E2",
              color: "#B91C1C",
              padding: "16px 18px",
              borderRadius: "14px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <h3>Loading topics...</h3>
        ) : topics.length === 0 ? (
          <div
            style={{
              background: "#FEF3C7",
              padding: "25px",
              borderRadius: "15px",
            }}
          >
            <h3>No topics available.</h3>
            <p>Add topics for this subject in the backend to continue.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: "25px",
            }}
          >
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => handleOpenLesson(topic)}
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  padding: "25px",
                  cursor: "pointer",
                  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
                  transition: ".3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 25px rgba(0,0,0,.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 5px 15px rgba(0,0,0,.08)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      background: "#DBEAFE",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#2563EB",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </div>

                  <span
                    style={{
                      background: "#DCFCE7",
                      color: "#166534",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    Ready
                  </span>
                </div>

                <h3
                  style={{
                    color: "#1E40AF",
                    marginBottom: "12px",
                  }}
                >
                  {topic.title}
                </h3>

                <p
                  style={{
                    color: "#6B7280",
                    lineHeight: "1.6",
                    minHeight: "70px",
                  }}
                >
                  {topic.description}
                </p>

                <button
                  style={{
                    marginTop: "20px",
                    width: "100%",
                    border: "none",
                    background: "#2563EB",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Open Lesson
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SubjectDetails;
