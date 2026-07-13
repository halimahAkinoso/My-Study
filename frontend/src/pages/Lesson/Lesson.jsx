import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getLesson } from "../../services/lessonService";

function Lesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [topicId]);

  async function loadLesson() {
    try {
      const data = await getLesson(topicId);
      setLesson(data);
    } catch (error) {
      console.log(error);
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
        ← Back
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

      {/* Lesson Notes */}
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "15px",
          marginBottom: "30px",
          boxShadow: "0 5px 15px rgba(0,0,0,.08)",
        }}
      >
        <h2>📘 Lesson Notes</h2>

        <div
          style={{
            lineHeight: "1.8",
            color: "#374151",
          }}
        >
          <ReactMarkdown>
            {lesson.notes}
          </ReactMarkdown>
        </div>
      </div>

      {/* Image */}
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
          <h2>🖼 Lesson Illustration</h2>

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

      {/* Video */}
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
          <h2>🎥 Watch Video</h2>

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
        </div>
      )}

      {/* PDF */}
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
          <h2>📄 PDF Resource</h2>

          <a
            href={lesson.pdf_url}
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

      {/* AI Quiz */}
      <div
        style={{
          background: "#DBEAFE",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
        }}
      >
        <h2>Ready to test yourself?</h2>

        <p>
          Complete a 20-question AI-powered quiz based on this lesson.
        </p>

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
          Start AI Quiz →
        </button>
      </div>
    </DashboardLayout>
  );
}

export default Lesson;