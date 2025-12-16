import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Zap, 
  Settings, 
  BarChart2, 
  LogOut, 
  User, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  ChevronDown
} from "lucide-react";
import "./CreatorDashboard.css";
import { getMyQuizzes, deleteQuiz, updateQuiz } from "./api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import ThemeToggle from "./components/ThemeToggle";

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Creator";
  const userId = localStorage.getItem("userId");
  
  const [activeTab, setActiveTab] = useState("quizzes");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showActive, setShowActive] = useState(true);
  
  // Flashcard Settings State
  const [flashcardSettings, setFlashcardSettings] = useState({
    shuffle: false,
    timer: true,
    timerDuration: 60
  });

  useEffect(() => {
    if (activeTab === "quizzes") {
      fetchQuizzes();
    }
  }, [activeTab]);

  const fetchQuizzes = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getMyQuizzes(userId);
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q._id !== id && q.id !== id));
    } catch (err) {
      console.error("Failed to delete quiz", err);
      alert("Failed to delete quiz");
    }
  };

  const handleToggleActive = async (quiz) => {
    try {
      const updatedQuiz = await updateQuiz(quiz._id || quiz.id, { isPublished: !quiz.isPublished });
      setQuizzes(quizzes.map(q => (q._id === updatedQuiz._id || q.id === updatedQuiz.id) ? updatedQuiz : q));
    } catch (err) {
      console.error("Failed to update quiz status", err);
      alert("Failed to update quiz status");
    }
  };

  const handleEdit = (quiz) => {
    // Navigate to create-quiz with quiz data to edit
    // Note: CreateQuiz needs to handle location state to populate fields
    navigate("/create-quiz", { state: { quizToEdit: quiz } });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const SidebarItem = ({ icon: Icon, label, id, active }) => (
    <div 
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={20} />
      <span className="sidebar-label">{label}</span>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">Q</div>
          <span className="brand-name">QuizRise</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              id="dashboard" 
              active={activeTab === "dashboard"} 
            />
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Materials</div>
            <SidebarItem 
              icon={FileText} 
              label="My Quizzes" 
              id="quizzes" 
              active={activeTab === "quizzes"} 
            />
            <SidebarItem 
              icon={Zap} 
              label="Flashcards" 
              id="flashcards" 
              active={activeTab === "flashcards"} 
            />
          </div>

          <div className="nav-group">
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              id="settings" 
              active={activeTab === "settings"} 
            />
            <SidebarItem 
              icon={BarChart2} 
              label="Statistics" 
              id="statistics" 
              active={activeTab === "statistics"} 
            />
          </div>
        </nav>

        <div className="sidebar-footer">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
                <ThemeToggle />
            </div>
            <button className="logout-btn-sidebar" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="classroom-selector">
            <User size={16} />
            <span className="classroom-name">{username}'s Classroom</span>
            <ChevronDown size={14} />
          </div>
        </header>

        {/* Content Area */}
        <div className="content-scrollable">
          {activeTab === "quizzes" && (
            <div className="quizzes-view">
              <div className="view-header">
                <div>
                    <h1 className="view-title">My Quizzes</h1>
                    <p className="view-subtitle">Manage your quizzes here. You can edit and delete quizzes.</p>
                </div>
              </div>

              <div className="controls-bar">
                <div className="toggle-group" onClick={() => setShowActive(!showActive)} style={{cursor: 'pointer'}}>
                    <div className={`toggle-switch ${showActive ? '' : 'off'}`}>
                        <div className={`switch ${showActive ? 'on' : ''}`}></div>
                    </div>
                    <span>Show Active</span>
                </div>
                <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => navigate("/create-quiz")}>
                        <Eye size={16} />
                        Preview Mode
                    </button>
                    <button className="btn-primary" onClick={() => navigate("/create-quiz")}>
                        <Plus size={16} />
                        Create Quiz
                    </button>
                </div>
              </div>

              <div className="quiz-cards-list">
                {loading ? (
                    <p>Loading quizzes...</p>
                ) : quizzes.length === 0 ? (
                    <div className="empty-state">
                        <p>No quizzes found. Create your first quiz!</p>
                    </div>
                ) : (
                    quizzes.map((quiz, index) => (
                        <div key={quiz.id || quiz._id} className="quiz-card-item">
                            <div className="quiz-card-header">
                                <span className="quiz-number">{index + 1}.</span>
                                <h3 className="quiz-title">{quiz.title}</h3>
                                <div className="card-actions">
                                    <button title="Edit" onClick={(e) => { e.stopPropagation(); handleEdit(quiz); }}><Edit size={16} /></button>
                                    <button title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(quiz.id || quiz._id); }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="quiz-card-body">
                                <div 
                                  className={`quiz-info-row ${quiz.isPublished ? 'success' : ''}`} 
                                  style={{ cursor: 'pointer' }} 
                                  onClick={(e) => { e.stopPropagation(); handleToggleActive(quiz); }} 
                                  title="Click to toggle active status"
                                >
                                    <span className="info-label">ID</span>
                                    <span className="info-value" title={quiz.id || quiz._id}>
                                      {(quiz.id || quiz._id || "").substring(0, 8)}...
                                    </span>
                                    {quiz.isPublished ? (
                                      <CheckCircle size={16} className="check-icon" />
                                    ) : (
                                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--text-secondary)' }} />
                                    )}
                                </div>
                                <div className="quiz-info-row">
                                    <span className="info-label">Q</span>
                                    <span className="info-value">{quiz.questions?.length || 0} Questions</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="dashboard-overview">
                <h1 className="view-title">Dashboard Overview</h1>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Quizzes</h3>
                        <div className="stat-value">{quizzes.length}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Total Participants</h3>
                        <div className="stat-value">0</div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === "flashcards" && (
            <div className="flashcards-view">
              <div className="view-header">
                <div>
                    <h1 className="view-title">Flashcards</h1>
                    <p className="view-subtitle">Manage your study sets and track progress.</p>
                </div>
              </div>

              {/* Statistics Section */}
              <h3 className="section-title">Statistics</h3>
              <div className="stats-grid">
                  <div className="stat-card">
                      <h3>Sets Created</h3>
                      <div className="stat-value">3</div>
                  </div>
                  <div className="stat-card">
                      <h3>Cards Mastered</h3>
                      <div className="stat-value">85%</div>
                  </div>
                  <div className="stat-card">
                      <h3>Study Streak</h3>
                      <div className="stat-value">5 Days</div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-view">
              <div className="view-header">
                <div>
                    <h1 className="view-title">Settings</h1>
                    <p className="view-subtitle">Manage your application preferences.</p>
                </div>
              </div>

              <h3 className="section-title">Flashcard Settings</h3>
              <div className="settings-card">
                  <div className="setting-row">
                      <div className="setting-info">
                          <h4>Shuffle Cards</h4>
                          <p>Randomize the order of cards during review.</p>
                      </div>
                      <div className={`toggle-switch ${flashcardSettings.shuffle ? '' : 'off'}`} onClick={() => setFlashcardSettings({...flashcardSettings, shuffle: !flashcardSettings.shuffle})}>
                          <div className={`switch ${flashcardSettings.shuffle ? 'on' : ''}`}></div>
                      </div>
                  </div>
                  
                  <div className="setting-row">
                      <div className="setting-info">
                          <h4>Timer</h4>
                          <p>Enable timer for each card review session.</p>
                      </div>
                      <div className={`toggle-switch ${flashcardSettings.timer ? '' : 'off'}`} onClick={() => setFlashcardSettings({...flashcardSettings, timer: !flashcardSettings.timer})}>
                          <div className={`switch ${flashcardSettings.timer ? 'on' : ''}`}></div>
                      </div>
                  </div>

                  {flashcardSettings.timer && (
                      <div className="setting-row">
                          <div className="setting-info">
                              <h4>Timer Duration (seconds)</h4>
                          </div>
                          <input 
                            type="number" 
                            className="setting-input"
                            value={flashcardSettings.timerDuration}
                            onChange={(e) => setFlashcardSettings({...flashcardSettings, timerDuration: parseInt(e.target.value)})}
                          />
                      </div>
                  )}
              </div>
            </div>
          )}

          {activeTab === "statistics" && (
            <div className="statistics-view">
              <div className="view-header">
                <div>
                    <h1 className="view-title">Statistics</h1>
                    <p className="view-subtitle">Analyze participant performance and quiz engagement.</p>
                </div>
              </div>

              <div className="stats-grid">
                  <div className="stat-card">
                      <h3>Total Participants</h3>
                      <div className="stat-value">76</div>
                  </div>
                  <div className="stat-card">
                      <h3>Avg. Completion Rate</h3>
                      <div className="stat-value">82%</div>
                  </div>
                  <div className="stat-card">
                      <h3>Top Performing Quiz</h3>
                      <div className="stat-value">React Basics</div>
                  </div>
              </div>

              <div className="chart-section">
                <h3 className="section-title">Performance Overview</h3>
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Quiz 1', avgScore: 85, participants: 12 },
                        { name: 'Quiz 2', avgScore: 72, participants: 19 },
                        { name: 'Quiz 3', avgScore: 90, participants: 8 },
                        { name: 'Quiz 4', avgScore: 65, participants: 15 },
                        { name: 'Quiz 5', avgScore: 78, participants: 22 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#111827' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Legend />
                      <Bar dataKey="avgScore" name="Average Score (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="participants" name="Participants" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
