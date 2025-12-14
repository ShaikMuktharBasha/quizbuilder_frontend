// ParticipantDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyResults } from "./api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./ParticipantDashboard.css";

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
        <h2>Hello, Participant 👋</h2>
        <div className="header-right">
          <span className="user-name">{username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Attempt Quiz */}
        <div className="action-card small-card">
          <h3>Attempt Quiz</h3>
          <p>Take quizzes created by others and test your knowledge.</p>
          <button
            onClick={() => navigate("/attempt-quiz")}
            className="start-btn"
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
        <div className="action-card small-card">
          <h3>My Results</h3>
          <p>Check your past performance and track your progress.</p>
          <button onClick={() => navigate("/my-results")}>View Results</button>
        </div>

        {/* Performance Chart */}
        <div className="chart-section">
          <h3>Performance Overview</h3>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#8884d8" name="Score" />
                  <Bar dataKey="total" fill="#82ca9d" name="Total Questions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: '#fff' }}>No quiz data available yet.</p>
          )}
        </div>

        {/* About Participant */}
        <section className="about-participant">
          <h4>About Participant</h4>
          <p>
            As a participant, you can attempt quizzes created by others,
            check your scores, and track your progress.
            Stay active and challenge yourself!
          </p>
        </section>
      </div>
    </div>
  );
}
