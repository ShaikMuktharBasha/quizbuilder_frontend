import React, { useEffect, useState } from "react";
import { getMyResults } from "./api";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./MyResults.css";

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("User not found. Please login.");
      setLoading(false);
      return;
    }

    async function fetchResults() {
      try {
        const data = await getMyResults(userId);
        setResults(data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError("Failed to fetch quiz results. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [userId]);

  // Prepare data for chart
  const chartData = results.map(r => ({
    name: r.quizTitle || "Quiz",
    score: r.score,
    total: r.total
  }));

  return (
    <div className="results-container">
      <button className="go-back-btn" onClick={() => navigate("/participant-dashboard")} title="Go Back">
        ←
      </button>
      <div className="results-header-box">
        <h1 className="results-header">My Quiz Results</h1>
      </div>

      {loading ? (
        <p className="text-gray-600 text-center">Loading results...</p>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : results.length === 0 ? (
        <p className="text-gray-600 text-center">No quiz attempts yet.</p>
      ) : (
        <>
            <div className="chart-container" style={{ width: '100%', height: 300, marginBottom: '30px' }}>
                <h3>Performance Overview</h3>
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
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" name="Score" />
                        <Bar dataKey="total" fill="#82ca9d" name="Total Questions" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <table className="results-table">
            <thead>
                <tr>
                <th>Quiz Title</th>
                <th>Domain</th>
                <th>Score</th>
                <th>Total</th>
                <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {results.map((res) => (
                <tr key={res.id}>
                    <td>{res.quizTitle || "Untitled Quiz"}</td>
                    <td>{res.quizDomain || "N/A"}</td>
                    <td>{res.score}</td>
                    <td>{res.total}</td>
                    <td>{new Date(res.submittedAt).toLocaleString()}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </>
      )}
    </div>
  );
}
