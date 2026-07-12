import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import DashboardCard from "../../components/DashboardCard";
import ProgressChart from "../../components/ProgressChart";
import RecommendationCard from "../../components/RecommendationCard";

import { getSubjects } from "../../services/subjectService";

function Dashboard() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <DashboardLayout>
      <div>
        <h1
          style={{
            marginBottom: "5px",
            color: "#1E3A8A",
          }}
        >
          Welcome Back 👋
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "30px",
          }}
        >
          Continue your personalized learning journey.
        </p>

        {/* Statistics */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          <DashboardCard
            title="Courses Completed"
            value="12"
            color="#2563EB"
          />

          <DashboardCard
            title="Quiz Average"
            value="87%"
            color="#16A34A"
          />

          <DashboardCard
            title="Learning Hours"
            value="58 hrs"
            color="#EA580C"
          />

          <DashboardCard
            title="Current Streak"
            value="🔥 12 Days"
            color="#9333EA"
          />
        </div>

        <br />

        {/* Progress */}

        <h2>Learning Progress</h2>

        <ProgressChart />

        <br />

        {/* Subjects */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: "20px",
          }}
        >
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => navigate(`/subjects/${subject.id}`)}
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
                Open Subject →
              </button>
            </div>
          ))}
        </div>

        <br />

        {/* AI Recommendation */}

        <h2>AI Recommendations</h2>

        <RecommendationCard text="📘 Continue Algebra." />

        <RecommendationCard text="⚛ Practice Physics formulas." />

        <RecommendationCard text="🧪 Revise Organic Chemistry." />

        <RecommendationCard text="🤖 Ask the AI Tutor difficult questions." />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;