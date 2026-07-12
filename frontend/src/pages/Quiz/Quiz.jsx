import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getQuiz } from "../../services/quizService";

function Quiz() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, [topicId]);

  async function loadQuiz() {
    try {
      const data = await getQuiz(topicId);
      setQuestions(data);
    } catch (error) {
      console.log(error);
    }
  }

  function selectAnswer(questionId, answer) {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  }

  function submitQuiz() {
    let total = 0;

    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        total++;
      }
    });

    setScore(total);
    setSubmitted(true);
  }

  const percentage =
    questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate(-1)}
        style={{
          border: "none",
          background: "#2563EB",
          color: "white",
          padding: "10px 18px",
          borderRadius: "10px",
          cursor: "pointer",
          marginBottom: "25px",
        }}
      >
        ← Back to Lesson
      </button>

      <h1 style={{ color: "#1E40AF" }}>
        AI Quiz
      </h1>

      <p
        style={{
          color: "#6B7280",
          marginBottom: "30px",
        }}
      >
        Answer all questions before submitting.
      </p>

      {/* Progress */}

      <div
        style={{
          background: "#E5E7EB",
          height: "12px",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            width: `${
              (Object.keys(answers).length /
                (questions.length || 1)) *
              100
            }%`,
            background: "#2563EB",
            height: "100%",
            transition: ".3s",
          }}
        />
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id}
          style={{
            background: "#fff",
            padding: "25px",
            marginBottom: "25px",
            borderRadius: "15px",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h3>
            Question {index + 1}
          </h3>

          <p
            style={{
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {question.question}
          </p>

          {[
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
          ].map((option) => (
            <label
              key={option}
              style={{
                display: "block",
                marginBottom: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "10px",
                background:
                  answers[question.id] === option
                    ? "#DBEAFE"
                    : "#F9FAFB",
              }}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={
                  answers[question.id] === option
                }
                onChange={() =>
                  selectAnswer(
                    question.id,
                    option
                  )
                }
                disabled={submitted}
              />

              {"  "}

              {option}
            </label>
          ))}

          {submitted && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "10px",
                background:
                  answers[question.id] ===
                  question.correct_answer
                    ? "#DCFCE7"
                    : "#FEE2E2",
              }}
            >
              <strong>
                Correct Answer:
              </strong>{" "}
              {question.correct_answer}
            </div>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={submitQuiz}
          style={{
            background: "#2563EB",
            color: "white",
            border: "none",
            padding: "15px 35px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "30px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h2>Quiz Completed 🎉</h2>

          <h1
            style={{
              color: "#2563EB",
            }}
          >
            {score} / {questions.length}
          </h1>

          <h2>{percentage}%</h2>

          <h3
            style={{
              color:
                percentage >= 50
                  ? "#16A34A"
                  : "#DC2626",
            }}
          >
            {percentage >= 50
              ? "PASS ✅"
              : "TRY AGAIN ❌"}
          </h3>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            style={{
              marginTop: "20px",
              background: "#16A34A",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Quiz;