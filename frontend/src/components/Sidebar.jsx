import {
  FaHome,
  FaBook,
  FaLayerGroup,
  FaRobot,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Subjects",
      path: "/subjects",
      icon: <FaBook />,
    },
    {
      name: "Topics",
      path: "/topics",
      icon: <FaLayerGroup />,
    },
    {
      name: "AI Tutor",
      path: "/chat",
      icon: <FaRobot />,
    },
    {
      name: "Progress",
      path: "/progress",
      icon: <FaChartLine />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <FaCog />,
    },
  ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside
      style={{
        width: "260px",
        background: "#1E40AF",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "25px 18px",
        boxSizing: "border-box",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "35px",
          }}
        >
          <FaGraduationCap size={32} />

          <div>
            <h2
              style={{
                margin: 0,
              }}
            >
              StudyHub
            </h2>

            <small>AI Learning Platform</small>
          </div>
        </div>

        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "14px",
              marginBottom: "10px",
              borderRadius: "12px",
              color: "white",
              textDecoration: "none",
              background: isActive
                ? "#2563EB"
                : "transparent",
              transition: ".3s",
              fontWeight: 500,
            })}
          >
            <span
              style={{
                fontSize: "18px",
              }}
            >
              {item.icon}
            </span>

            {item.name}
          </NavLink>
        ))}
      </div>

      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#DC2626",
          color: "white",
          border: "none",
          padding: "14px",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;