// ParticipantDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyResults } from "./api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./ParticipantDashboard.css";
import ThemeToggle from "./components/ThemeToggle";

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("userId");

  const [results, setResults] = useState([]);

  useEffect(() => {
    if (userId) {
      getMyResults(userId)
        .then(data => setResults(data))
        .catch(err => console.error("Failed to fetch results:", err));
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Prepare data for chart
  const chartData = results.map(r => ({
    name: r.quizTitle || "Quiz",
    score: r.score,
    total: r.total
  }));

  return (
    <div className="participant-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h2>Hello, Participant </h2>
        <div className="header-right">
          <ThemeToggle />
          <span className="user-name">{username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Attempt Quiz */}
        <div className="action-card">
          <h3>Attempt Quiz</h3>
          <p>Take quizzes created by others and test your knowledge.</p>
          <button
            onClick={() => navigate("/attempt-quiz")}
            className="action-btn"
          >
            Start Quiz
          </button>
        </div>

        {/* Profile */}
        <div className="profile-box">
          <h3>Profile</h3>
          <p><strong>Name:</strong> {username}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Role:</strong> Participant</p>
        </div>

        {/* My Results */}
        <div className="action-card">
          <h3>My Results</h3>
          <p>Check your past performance and track your progress.</p>
          <button className="action-btn" onClick={() => navigate("/my-results")}>View Results</button>
        </div>

        {/* Performance Chart */}
        <div className="chart-section" style={{ gridColumn: "1 / -1", width: "100%", maxWidth: "800px", background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-md)" }}>
          <h3 style={{ marginBottom: "20px", color: "var(--text-primary)" }}>Performance Overview</h3>
          {results.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#111827' }} />
                  <Legend />
                  <Bar dataKey="score" fill="#2563eb" name="Score" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#93c5fd" name="Total Questions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>No results available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
