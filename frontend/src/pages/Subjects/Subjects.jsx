import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getSubjects } from "../../services/subjectService";
import {
  DASHBOARD_SUBJECTS_CACHE_KEY,
  LAST_ACTIVE_SUBJECT_KEY,
  readStoredItem,
  writeStoredItem,
} from "../../utils/dashboardStorage";

function Subjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState(() =>
    readStoredItem(DASHBOARD_SUBJECTS_CACHE_KEY, [])
  );
  const [loading, setLoading] = useState(subjects.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
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
          ? "We couldn't refresh your subjects, so we're showing the last saved list."
          : "We couldn't load the subjects right now. Please try again."
      );
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenSubject(subject) {
    writeStoredItem(LAST_ACTIVE_SUBJECT_KEY, {
      id: subject.id,
      name: subject.name,
      updatedAt: new Date().toISOString(),
    });

    navigate(`/subjects/${subject.id}`);
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

        {error && (
          <div
            style={{
              background: "#FEF3C7",
              color: "#92400E",
              padding: "16px 18px",
              borderRadius: "14px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <h3>Loading subjects...</h3>
        ) : subjects.length === 0 ? (
          <h3>No subjects available yet.</h3>
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
                onClick={() => handleOpenSubject(subject)}
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
