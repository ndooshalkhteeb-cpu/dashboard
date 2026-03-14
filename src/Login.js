// src/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ← عدّل اليوزر والباسوورد هنا
const ADMIN_USER = "Admin";
const ADMIN_PASS = "Admin@2025#";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem("token", Math.random().toString(36).slice(2));
      navigate("/", { replace: true });
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: 100 }}>
      <h3 className="mb-4 text-center">Tamin Dashboard</h3>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Sign In
        </button>
      </form>
    </div>
  );
}
