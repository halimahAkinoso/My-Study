import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getSubjects } from "../../services/subjectService";

function Subjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const subjectIcons = {
    Mathematics: "📐",
    Physics: "⚛️",
    Chemistry: "🧪",
    Biology: "🧬",
    English: "📖",
    "Computer Science": "💻",
  };

  return (
    <DashboardLayout>
      <div>
        <h1
          style={{
            color: "#1E40AF",
            marginBottom: "10px",
          }}
        >
          Subjects
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "35px",
          }}
        >
          Select a subject to begin learning.
        </p>

        {loading ? (
          <h3>Loading subjects...</h3>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: "25px",
            }}
          >
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => navigate(`/subjects/${subject.id}`)}
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  padding: "30px",
                  cursor: "pointer",
                  transition: ".3s",
                  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
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
                    fontSize: "55px",
                    marginBottom: "20px",
                  }}
                >
                  {subjectIcons[subject.name] || "📚"}
                </div>

                <h2
                  style={{
                    color: "#1E40AF",
                    marginBottom: "12px",
                  }}
                >
                  {subject.name}
                </h2>

                <p
                  style={{
                    color: "#6B7280",
                    lineHeight: "1.6",
                  }}
                >
                  Learn concepts, study interactive lessons,
                  practice quizzes and get AI assistance.
                </p>

                <button
                  style={{
                    marginTop: "25px",
                    background: "#2563EB",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "bold",
                  }}
                >
                  Open Subject →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Subjects;