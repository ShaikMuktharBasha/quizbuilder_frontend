import React, { useState, useEffect, useRef } from 'react';
import { generateQuizQuestions } from './api';
import './QuizChatbot.css';

export default function QuizChatbot({ quiz, setQuiz, questions, setQuestions, setStep }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AI Quiz Assistant. I can help you generate a quiz instantly. What topic would you like the quiz to be about?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [chatState, setChatState] = useState('GET_TOPIC'); 
  const [generationParams, setGenerationParams] = useState({
      topic: "",
      count: 5,
      difficulty: "Medium"
  });
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const handleGeneration = async (topic, difficulty, count) => {
    try {
        const generated = await generateQuizQuestions(topic, difficulty, count);
        if (Array.isArray(generated)) {
            const formatted = generated.map(q => ({
                text: q.questionText,
                options: q.options || [q.optionA, q.optionB, q.optionC, q.optionD],
                answer: q.correctOption
            }));
            setQuestions(prev => [...prev, ...formatted]);
            addMessage(`Successfully added ${generated.length} questions on "${topic}"! You can review them in the editor.`, 'bot');
            
            // Optionally, we could ask if they want to generate more or close.
            addMessage("Do you want to generate more questions? (Type 'yes' to start over, or 'no' to close chat)", 'bot');
            setChatState('CONFIRM_RESTART');
        } else {
            addMessage("Received unexpected format from AI.", 'bot');
        }
    } catch (error) {
        console.error("Generation error:", error);
        addMessage("Sorry, I couldn't generate questions at this moment. Please try again.", 'bot');
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userText = inputValue.trim();
    addMessage(userText, 'user');
    setInputValue("");
    
    processInput(userText);
  };

  const processInput = (text) => {
    const lowerText = text.toLowerCase();

    // Global commands / Interrupts
    if (lowerText.includes("restart") || lowerText.includes("start over")) {
      setChatState('GET_TOPIC');
      setGenerationParams({ topic: "", count: 5, difficulty: "Medium" });
      addMessage("Okay, let's start over. What topic would you like the quiz to be about?", 'bot');
      return;
    }

    // State machine
    switch (chatState) {
      case 'GET_TOPIC':
        setGenerationParams(prev => ({ ...prev, topic: text }));
        addMessage(`Great! How many questions should I generate? (Max 10)`, 'bot');
        setChatState('GET_COUNT');
        break;

      case 'GET_COUNT':
        const count = parseInt(text);
        if (isNaN(count) || count < 1 || count > 10) {
            addMessage("Please enter a valid number between 1 and 10.", 'bot');
        } else {
            setGenerationParams(prev => ({ ...prev, count: count }));
            addMessage("Got it. What difficulty level would you like? (Easy, Medium, Hard)", 'bot');
            setChatState('GET_DIFFICULTY');
        }
        break;

      case 'GET_DIFFICULTY':
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (validDifficulties.includes(lowerText)) {
            // Capitalize first letter for display/API
            const difficulty = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            setGenerationParams(prev => ({ ...prev, difficulty: difficulty }));
            
            addMessage(`Generating ${generationParams.count} ${difficulty} questions on "${generationParams.topic}"... Please wait.`, 'bot');
            handleGeneration(generationParams.topic, difficulty, generationParams.count);
            setChatState('GENERATING'); // Temporary state
        } else {
            addMessage("Please choose a valid difficulty: Easy, Medium, or Hard.", 'bot');
        }
        break;

      case 'CONFIRM_RESTART':
        if (lowerText === 'yes') {
            setChatState('GET_TOPIC');
            addMessage("Okay, what topic would you like the quiz to be about?", 'bot');
        } else if (lowerText === 'no') {
            addMessage("Goodbye! Happy quizzing.", 'bot');
            setTimeout(() => setIsOpen(false), 2000);
        } else {
             addMessage("Please reply 'yes' or 'no'.", 'bot');
        }
        break;

      case 'GENERATING':
        addMessage("I am currently generating your quiz. Please wait a moment.", 'bot');
        break;

      default:
        addMessage("I'm not sure what you mean. We can start over if you type 'restart'.", 'bot');
    }
  };

  const updateOption = (index, text) => {
    // Deprecated for chatbot, but kept if needed for other components
  };

  const RobotIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#botGradient)"/>
      <path d="M35 45C35 42.2 37.2 40 40 40C42.8 40 45 42.2 45 45V55C45 57.8 42.8 60 40 60C37.2 60 35 57.8 35 55V45Z" fill="white"/>
      <path d="M55 45C55 42.2 57.2 40 60 40C62.8 40 65 42.2 65 45V55C65 57.8 62.8 60 60 60C57.2 60 55 57.8 55 55V45Z" fill="white"/>
      <path d="M40 70C40 70 45 75 50 75C55 75 60 70 60 70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );

  const RobotIconSimple = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 10H10V14H8V10Z" fill="currentColor"/>
        <path d="M14 10H16V14H14V10Z" fill="currentColor"/>
        <path d="M9 17C9 17 10.5 19 12 19C13.5 19 15 17 15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  if (!isOpen) {
    return (
      <div className="chatbot-closed-wrapper">
         <div className="chatbot-tooltip" onClick={() => setIsOpen(true)}>
            <span>👋 Need help using Quiz Builder?</span>
         </div>
         <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
            <div className="toggle-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
         </button>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-info">
            <div className="bot-avatar-header">
                <RobotIconSimple />
            </div>
            <div className="header-text">
                <h3>Quiz Assistant</h3>
                <span className="status">● Online</span>
            </div>
        </div>
        <div className="header-actions">
            <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close Chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrapper ${msg.sender}`}>
            {msg.sender === 'bot' && (
                <div className="bot-avatar-message">
                   <RobotIconSimple />
                </div>
            )}
            <div className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button className="send-btn" onClick={handleSend} disabled={!inputValue.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        </button>
      </div>
    </div>
  );
}
