import { useNavigate } from "react-router-dom";
import {
  FaCalculator,
  FaAtom,
  FaFlask,
  FaLeaf,
  FaBookOpen,
  FaLaptopCode,
} from "react-icons/fa";

function SubjectCard({ subject, id }) {
  const navigate = useNavigate();

  const icons = {
    Mathematics: <FaCalculator size={40} />,
    Physics: <FaAtom size={40} />,
    Chemistry: <FaFlask size={40} />,
    Biology: <FaLeaf size={40} />,
    English: <FaBookOpen size={40} />,
    "Computer Science": <FaLaptopCode size={40} />,
  };

  return (
    <div
      onClick={() => navigate(`/subjects/${id}`)}
      style={{
        background: "#fff",
        borderRadius: "15px",
        padding: "30px",
        cursor: "pointer",
        textAlign: "center",
        transition: "0.3s",
        boxShadow: "0 5px 15px rgba(0,0,0,.08)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ color: "#2563eb", marginBottom: "15px" }}>
        {icons[subject]}
      </div>

      <h3>{subject}</h3>
    </div>
  );
}

export default SubjectCard;