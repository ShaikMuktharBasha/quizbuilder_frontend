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
  Bell, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  ChevronDown,
  Search
} from "lucide-react";
import "./CreatorDashboard.css";
import { getMyQuizzes } from "./api";

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Creator";
  const userId = localStorage.getItem("userId");
  
  const [activeTab, setActiveTab] = useState("quizzes");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

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
          <div className="header-actions">
            <button className="icon-btn"><Search size={20} /></button>
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
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
                <div className="toggle-group">
                    <div className="toggle-switch">
                        <div className="switch on"></div>
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
                        <div key={quiz._id} className="quiz-card-item">
                            <div className="quiz-card-header">
                                <span className="quiz-number">{index + 1}.</span>
                                <h3 className="quiz-title">{quiz.title}</h3>
                                <div className="card-actions">
                                    <button title="Edit"><Edit size={16} /></button>
                                    <button title="Delete"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="quiz-card-body">
                                <div className="quiz-info-row success">
                                    <span className="info-label">ID</span>
                                    <span className="info-value">{quiz.quizId}</span>
                                    <CheckCircle size={16} className="check-icon" />
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
        </div>
      </main>
    </div>
  );
}
