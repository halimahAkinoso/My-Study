import { FaBell, FaUserCircle, FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/subjects": "Subjects",
    "/topics": "Topics",
    "/chat": "AI Tutor",
    "/progress": "Learning Progress",
    "/settings": "Settings",
  };

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/subjects/")
      ? "Subject Details"
      : location.pathname.startsWith("/lesson/")
      ? "Lesson"
      : location.pathname.startsWith("/quiz/")
      ? "Quiz"
      : "StudyHub");

  return (
    <header
      style={{
        background: "#fff",
        height: "80px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            color: "#1E3A8A",
          }}
        >
          {title}
        </h2>

        <small
          style={{
            color: "#6B7280",
          }}
        >
          Personalized Learning Platform
        </small>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#F3F4F6",
            padding: "10px 15px",
            borderRadius: "12px",
          }}
        >
          <FaSearch color="#6B7280" />

          <input
            placeholder="Search..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "15px",
            }}
          />
        </div>

        <FaBell
          size={22}
          color="#1E3A8A"
          style={{
            cursor: "pointer",
          }}
        />

        <FaUserCircle
          size={36}
          color="#2563EB"
        />
      </div>
    </header>
  );
}

export default Navbar;