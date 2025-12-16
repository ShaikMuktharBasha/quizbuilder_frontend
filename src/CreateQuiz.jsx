import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateQuiz.css";
import { createQuiz, updateQuiz } from "./api";
import QuizChatbot from "./QuizChatbot";
import ThemeToggle from "./components/ThemeToggle";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [quizId, setQuizId] = useState(null);

  // Quiz details
  const [quiz, setQuiz] = useState({
    title: "",
    description: ""
  });

  useEffect(() => {
    if (location.state?.quizToEdit) {
      const quizToEdit = location.state.quizToEdit;
      setIsEditing(true);
      setQuizId(quizToEdit.id || quizToEdit._id);
      setQuiz({
        title: quizToEdit.title,
        description: quizToEdit.description || ""
      });
      
      if (quizToEdit.questions) {
        const formattedQuestions = quizToEdit.questions.map(q => ({
          text: q.questionText,
          options: [q.optionA, q.optionB, q.optionC, q.optionD],
          answer: q.correctOption,
          required: true
        }));
        setQuestions(formattedQuestions);
      }
    }
  }, [location.state]);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    answer: "",
    required: true
  });

  // Edit state
  const [editIndex, setEditIndex] = useState(null);

  // Saved quiz response
  const [savedQuiz, setSavedQuiz] = useState(null);

  const handleQuizChange = (e) => {
    setQuiz({ ...quiz, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e, index) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = e.target.value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const addQuestion = () => {
    if (!newQuestion.text || !newQuestion.answer) {
      alert("Please fill question and select correct answer!");
      return;
    }

    const cleanedOptions = newQuestion.options.filter(
      (opt) => opt && opt.trim() !== ""
    );

    const formattedQuestion = {
      ...newQuestion,
      options: cleanedOptions
    };

    if (editIndex !== null) {
      // Update existing question
      const updated = [...questions];
      updated[editIndex] = formattedQuestion;
      setQuestions(updated);
      setEditIndex(null);
    } else {
      // Add new question
      setQuestions([...questions, formattedQuestion]);
    }

    // Reset input
    setNewQuestion({ text: "", options: ["", "", "", ""], answer: "" });
  };

  const startEdit = (index) => {
    setNewQuestion(questions[index]);
    setEditIndex(index);
    setStep(2);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    const createdBy = localStorage.getItem("userId");
    if (!createdBy) {
      alert("You must be logged in to create a quiz!");
      return;
    }

    const payload = {
      title: quiz.title,
      description: quiz.description || "",
      createdBy: createdBy,
      questions: questions.map((q) => ({
        questionText: q.text,
        optionA: q.options[0] || "",
        optionB: q.options[1] || "",
        optionC: q.options[2] || "",
        optionD: q.options[3] || "",
        correctOption: q.answer,
        explanation: q.explanation || ""
      }))
    };

    console.log("Final Payload:", JSON.stringify(payload, null, 2));

    try {
      let saved;
      if (isEditing && quizId) {
        saved = await updateQuiz(quizId, payload);
        alert("Quiz updated successfully!");
      } else {
        saved = await createQuiz(payload);
        alert("Quiz created successfully!");
      }
      setSavedQuiz(saved);
      setStep(4);
    } catch (err) {
      console.error("Error saving quiz:", err);
      alert("Failed to save quiz!");
    }
  };

  return (
    <div className="create-quiz">
      <div className="theme-toggle-absolute">
        <ThemeToggle />
      </div>
      <button className="go-back-btn" onClick={() => navigate("/creator")} title="Go Back">
        ←
      </button>
      <h2>{isEditing ? "Edit Quiz" : "Create Quiz"}</h2>

      {/* Step 1: Quiz Details */}
      {step === 1 && (
        <div className="quiz-details">
          <label>Quiz Title:</label>
          <input
            type="text"
            name="title"
            value={quiz.title}
            onChange={handleQuizChange}
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={quiz.description}
            onChange={handleQuizChange}
            rows="3"
          />

          <button onClick={() => setStep(2)}>Next →</button>
        </div>
      )}

      {/* Step 2: Add/Edit Questions */}
      {step === 2 && (
        <div className="quiz-questions-card">
          <div className="question-header">
            <span className="question-number">Q{questions.length + 1}</span>
            <input
              type="text"
              className="question-title-input"
              placeholder="Untitled question"
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, text: e.target.value })
              }
            />
          </div>

          <div className="options-list">
            {newQuestion.options.map((opt, idx) => {
                const optionKey = String.fromCharCode(65 + idx); // "A", "B", "C", "D"
                const isCorrect = newQuestion.answer === optionKey;
                
                return (
                    <div key={idx} className={`option-row ${isCorrect ? 'correct-option' : ''}`}>
                        <button className="remove-option-btn" title="Clear option" onClick={() => {
                            const updatedOptions = [...newQuestion.options];
                            updatedOptions[idx] = "";
                            setNewQuestion({ ...newQuestion, options: updatedOptions });
                        }}>
                            🗑️
                        </button>
                        
                        <input
                            type="text"
                            className="option-input"
                            value={opt}
                            placeholder={`Option ${optionKey}`}
                            onChange={(e) => handleQuestionChange(e, idx)}
                        />
                        
                        <div 
                            className={`correct-toggle ${isCorrect ? 'checked' : ''}`}
                            onClick={() => setNewQuestion({ ...newQuestion, answer: optionKey })}
                            title="Mark as correct answer"
                        >
                            {isCorrect && <span className="checkmark">✓</span>}
                        </div>
                    </div>
                );
            })}
          </div>

          <div className="add-answer-row">
             <button className="add-answer-btn" disabled>+ Answer (Fixed 4)</button>
          </div>

          <div className="question-footer">
             <div className="footer-left">
                <div className="dropdown-mock">
                    Single choice ⌄
                </div>
             </div>
             <div className="footer-right">
                <div className="toggle-group" onClick={() => setNewQuestion({...newQuestion, required: !newQuestion.required})}>
                    <span className="toggle-label">Required</span>
                    <div className={`toggle-switch ${newQuestion.required ? '' : 'off'}`}>
                        <div className={`switch ${newQuestion.required ? 'on' : ''}`}></div>
                    </div>
                </div>
                <div className="points-input">
                    <input type="number" defaultValue={10} /> 
                    <span>Points</span>
                </div>
             </div>
          </div>

          <div className="action-buttons-row">
             <button className="secondary-btn" onClick={() => setStep(1)}>Back</button>
             <button className="primary-btn" onClick={addQuestion}>
                {editIndex !== null ? "Update" : "Add Question"}
             </button>
             {questions.length > 0 && (
                 <button className="save-btn" onClick={() => setStep(3)}>Review & Save</button>
             )}
          </div>

          {questions.length > 0 && (
            <div className="added-questions-preview">
                <h3>Added Questions ({questions.length})</h3>
                <ul className="preview-list">
                    {questions.map((q, i) => (
                    <li key={i} className="preview-item">
                        <span className="preview-text">{i + 1}. {q.text}</span>
                        <div className="preview-actions">
                            <button onClick={() => startEdit(i)}>✏️</button>
                            <button onClick={() => deleteQuestion(i)}>🗑️</button>
                        </div>
                    </li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Save */}
      {step === 3 && (
        <div className="review-quiz">
          <h3>Review Quiz</h3>
          <p>
            <strong>Title:</strong> {quiz.title}
          </p>
          <p>
            <strong>Description:</strong> {quiz.description}
          </p>

          <h4>Questions:</h4>
          <ol>
            {questions.map((q, i) => (
              <li key={i}>
                {q.text}
                <ul>
                  {q.options.map((opt, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontWeight:
                          q.answer === String.fromCharCode(65 + idx)
                            ? "bold"
                            : "normal",
                        color:
                          q.answer === String.fromCharCode(65 + idx)
                            ? "green"
                            : "black"
                      }}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="buttons">
            <button onClick={() => setStep(2)}>← Previous</button>
            <button onClick={saveQuiz}>Save Quiz ✅</button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && savedQuiz && (
        <div className="confirmation">
          <h3>🎉 Quiz Created Successfully!</h3>
          <p>
            <strong>Quiz ID:</strong> {savedQuiz.id}
          </p>
          <p>
            <strong>Title:</strong> {savedQuiz.title}
          </p>
          <p>
            <strong>Description:</strong> {savedQuiz.description}
          </p>

          <h4>Questions:</h4>
          <ol>
            {savedQuiz.questions.map((q, i) => (
              <li key={i}>
                {q.questionText}
                <ul>
                  <li>A. {q.optionA}</li>
                  <li>B. {q.optionB}</li>
                  <li>C. {q.optionC}</li>
                  <li>D. {q.optionD}</li>
                </ul>
              </li>
            ))}
          </ol>

          <button onClick={() => window.location.reload()}>
            ➕ Create Another Quiz
          </button>
        </div>
      )}

      <QuizChatbot 
        quiz={quiz} 
        setQuiz={setQuiz} 
        questions={questions} 
        setQuestions={setQuestions}
        setStep={setStep}
      />
    </div>
  );
}
