import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">

      <form className="login-card" onSubmit={handleSubmit}>

        <h1>StudyHub</h1>
        <h2>Welcome Back 👋</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

      </form>

    </div>
  );
}

export default Login;