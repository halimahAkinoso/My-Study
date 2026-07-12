function DashboardCard({ title, value, color }) {
  return (
    <div
      style={{
        background: color,
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        minWidth: "200px",
        flex: 1,
      }}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}

export default DashboardCard;