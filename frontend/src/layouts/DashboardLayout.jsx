import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F3F4F6",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Right Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "30px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "30px",
              minHeight: "calc(100vh - 120px)",
              boxShadow: "0 4px 18px rgba(0,0,0,.08)",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;