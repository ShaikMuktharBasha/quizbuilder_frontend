import React, { useEffect, useState } from "react";
import { getAllQuizzes, getMyResults, submitQuiz } from "./api";
import { useNavigate } from "react-router-dom";
import "./AttemptQuiz.css";
import ThemeToggle from "./components/ThemeToggle";

export default function AttemptQuiz() {
  const [step, setStep] = useState("start"); // start → domains → quizzes → active → result
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptedQuizIds, setAttemptedQuizIds] = useState([]);

  const userId = localStorage.getItem("userId") || "1";
  const navigate = useNavigate();

  // ✅ Get already attempted quizzes
  useEffect(() => {
    getMyResults(userId)
      .then((res) => setAttemptedQuizIds(res.map((r) => r.quizId))) // Assuming quizId is in response
      .catch((err) => console.error(err));
  }, [userId]);

  // ✅ Load all quizzes
  const loadAllQuizzes = async () => {
    setStep("quizzes");
    setResult(null);
    setActiveQuiz(null);
    setAnswers({});
    try {
      const data = await getAllQuizzes();
      setQuizzes(data.quizzes || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
      alert("Failed to load quizzes");
    }
  };

  // ✅ Start quiz
  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setStep("active");
    setAnswers({});
    setResult(null);
    setCurrentQuestionIndex(0);
    // Removed timeLimit since it's not in the new schema
    setTimeLeft(null);
  };

  // ✅ Timer logic
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ✅ Submit quiz
const handleSubmit = async () => {
  if (!activeQuiz) return;
  try {
    // ✅ Build map of answers { questionId: selectedAnswer }
    const mappedAnswers = {};
    activeQuiz.questions.forEach((q) => {
      const qId = q.id || q._id;
      mappedAnswers[qId] = answers[qId] || "";
    });

    // 🔍 Debug logs
    console.log("👉 Questions:", activeQuiz.questions.map(q => ({ id: q.id || q._id, text: q.questionText })));
    console.log("👉 Selected answers object:", answers);
    console.log("👉 Payload to send:", { userId, answers: mappedAnswers });

    const res = await submitQuiz(activeQuiz.id, {
      userId,
      answers: mappedAnswers,
    });

    console.log("✅ Backend response:", res);

    // Show success message and redirect to results page
    alert(`Quiz submitted successfully! You scored ${res.score} out of ${res.total}`);
    navigate("/my-results");
  } catch (err) {
    console.error("❌ Error submitting quiz:", err);
  }
};



  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="attempt-container">
      <div className="theme-toggle-absolute">
        <ThemeToggle />
      </div>
      <button className="go-back-btn" onClick={() => navigate("/participant-dashboard")} title="Go Back">
        ←
      </button>
      <h1 className="title">Attempt Quiz</h1>

      {/* STEP 1: Start button */}
      {step === "start" && (
        <div className="start-step">
          <button className="main-start-btn" onClick={() => loadAllQuizzes()}>
            Start Quiz
          </button>
          <div style={{ marginTop: '20px' }}>
            <button className="back-btn" onClick={() => navigate("/participant-dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Quizzes list */}
      {step === "quizzes" && (
        <div className="quiz-list">
          <h2>Available Quizzes</h2>
          {quizzes.length === 0 && <p>No quizzes available.</p>}
          {quizzes.map((q) => (
            <div key={q.id} className="quiz-card">
              <h3>{q.title}</h3>
              <p>Time Limit: {q.timeLimit || "N/A"} mins</p>
              {attemptedQuizIds.includes(q.id) ? (
                <button className="disabled-btn" disabled>
                  Already Attempted
                </button>
              ) : (
                <button onClick={() => startQuiz(q)} className="start-btn">
                  Attempt
                </button>
              )}
            </div>
          ))}
          <button className="back-btn" onClick={() => setStep("start")}>
            ← Back
          </button>
        </div>
      )}

      {/* STEP 4: Active Quiz */}
      {step === "active" && activeQuiz && (
        <div className="quiz-box-centered">
          <div className="quiz-header-simple">
             <p className="quiz-instruction">Take the quiz to see your grade.</p>
          </div>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            {activeQuiz.questions.map((_, index) => (
                <div 
                    key={index} 
                    className={`progress-step ${index < currentQuestionIndex ? 'completed' : ''} ${index === currentQuestionIndex ? 'active' : ''}`}
                >
                    {index < currentQuestionIndex ? '✓' : index + 1}
                </div>
            ))}
          </div>

          {activeQuiz.questions.length === 0 ? (
            <p>No questions available for this quiz yet.</p>
          ) : (
            <div className="question-container">
                {(() => {
                    const q = activeQuiz.questions[currentQuestionIndex];
                    const qId = q.id || q._id;
                    const options = [q.optionA, q.optionB, q.optionC, q.optionD];
                    
                    return (
                        <div key={qId} className="single-question">
                            <h3 className="question-text-large">{q.questionText}</h3>
                            <div className="options-list">
                                {options.map((opt, i) => {
                                    const optionKey = String.fromCharCode(65 + i); // "A", "B", "C", "D"
                                    const isSelected = answers[qId] === optionKey;
                                    return (
                                        <label key={i} className={`option-item ${isSelected ? "selected" : ""}`}>
                                            <input 
                                                type="radio" 
                                                name={`question-${qId}`} 
                                                checked={isSelected}
                                                onChange={() => setAnswers({ ...answers, [qId]: optionKey })}
                                            />
                                            <span className="option-label-text">{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>
          )}

          <div className="quiz-navigation">
            <button 
                className="nav-btn prev-btn" 
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
            >
                Previous
            </button>
            
            {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                <button 
                    className="nav-btn next-btn" 
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(activeQuiz.questions.length - 1, prev + 1))}
                >
                    Next
                </button>
            ) : (
                <button onClick={handleSubmit} className="nav-btn submit-btn">
                    Submit
                </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: Result */}
      {step === "result" && result && (
        <div className="result-box">
          <h2>Result</h2>
          <p>
            You scored <b>{result.score}</b> out of {result.total}
          </p>
          <button onClick={() => setStep("quizzes")}>Back to Quizzes</button>
          <button onClick={() => navigate("/participant-dashboard")}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
