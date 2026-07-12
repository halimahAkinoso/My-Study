function RecommendationCard({ text }) {
  return (
    <div
      style={{
        background: "#EEF6FF",
        padding: "15px",
        borderLeft: "5px solid #2563eb",
        marginBottom: "10px",
      }}
    >
      {text}
    </div>
  );
}

export default RecommendationCard;