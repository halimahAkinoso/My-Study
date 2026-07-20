import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const location = useLocation();
    const { token, isInitializing } = useAuth();

    if (isInitializing) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#F3F4F6",
                    color: "#1E3A8A",
                    fontSize: "18px",
                    fontWeight: 600,
                }}
            >
                Restoring your study session...
            </div>
        );
    }

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
}

export default ProtectedRoute;
