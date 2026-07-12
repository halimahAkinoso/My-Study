import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import { getSubjects } from "../../services/subjectService";
import { getTopics } from "../../services/topicService";

function Topics() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [topicsBySubject, setTopicsBySubject] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const subjectData = await getSubjects();

      setSubjects(subjectData);

      const groupedTopics = {};

      for (const subject of subjectData) {
        const topics = await getTopics(subject.id);
        groupedTopics[subject.id] = topics;
      }

      setTopicsBySubject(groupedTopics);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading Topics...</h2>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1
          style={{
            color: "#1E40AF",
            marginBottom: "10px",
          }}
        >
          Topics
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "35px",
          }}
        >
          Browse every topic available across all subjects.
        </p>

        {subjects.map((subject) => (
          <div
            key={subject.id}
            style={{
              marginBottom: "45px",
            }}
          >
            <h2
              style={{
                color: "#2563EB",
                marginBottom: "20px",
              }}
            >
              {subject.name}
            </h2>

            {topicsBySubject[subject.id]?.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(260px,1fr))",
                  gap: "20px",
                }}
              >
                {topicsBySubject[subject.id].map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => navigate(`/lesson/${topic.id}`)}
                    style={{
                      background: "#fff",
                      borderRadius: "15px",
                      padding: "20px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                      transition: ".3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0)";
                    }}
                  >
                    <h3
                      style={{
                        color: "#1E40AF",
                      }}
                    >
                      {topic.title}
                    </h3>

                    <p
                      style={{
                        color: "#6B7280",
                        margin: "15px 0",
                        minHeight: "60px",
                      }}
                    >
                      {topic.description}
                    </p>

                    <button
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#2563EB",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Study Topic →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: "#FEF3C7",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                No topics available yet.
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Topics;