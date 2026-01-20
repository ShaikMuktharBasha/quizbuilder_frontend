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
      <circle cx="50" cy="50" r="50" fill="#0066FF"/>
      <path d="M50 20C50 17.2386 52.2386 15 55 15C57.7614 15 60 17.2386 60 20V28H40V20C40 17.2386 42.2386 15 45 15C47.7614 15 50 17.2386 50 20Z" fill="white"/>
      <rect x="25" y="28" width="50" height="40" rx="10" fill="white"/>
      <circle cx="40" cy="45" r="5" fill="#0066FF"/>
      <circle cx="60" cy="45" r="5" fill="#0066FF"/>
      <path d="M50 15L50 28" stroke="white" strokeWidth="4"/>
      <circle cx="50" cy="15" r="4" fill="white"/>
      <path d="M50 75L35 60H65L50 75Z" fill="white"/>
    </svg>
  );

  const RobotIconSimple = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1046 2 14 2.89543 14 4V6H10V4C10 2.89543 10.8954 2 12 2Z" fill="currentColor"/>
        <rect x="4" y="6" width="16" height="12" rx="4" fill="currentColor"/>
        <circle cx="9" cy="11" r="1.5" fill="white"/>
        <circle cx="15" cy="11" r="1.5" fill="white"/>
        <path d="M12 22L8 18H16L12 22Z" fill="currentColor"/>
    </svg>
  );

  if (!isOpen) {
    return (
      <div className="chatbot-closed-wrapper">
         <div className="chatbot-tooltip" onClick={() => setIsOpen(true)}>
            <span>✨ Generate Quiz with AI</span>
         </div>
         <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
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
                {/* Use SVG instead of img for crisp look */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1046 2 14 2.89543 14 4V6H10V4C10 2.89543 10.8954 2 12 2Z" fill="white"/>
                    <rect x="4" y="6" width="16" height="12" rx="4" fill="white"/>
                    <circle cx="9" cy="11" r="1.5" fill="#9b51e0"/>
                    <circle cx="15" cy="11" r="1.5" fill="#9b51e0"/>
                    <path d="M12 22L8 18H16L12 22Z" fill="white"/>
                </svg>
                <div className="online-indicator"></div>
            </div>
            <div className="header-text">
                <h3>LeadBot</h3>
                <span className="status">Online Now</span>
            </div>
        </div>
        <div className="header-actions">
            <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close Chat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          placeholder="Reply to LeadBot..."
        />
      </div>
    </div>
  );
}
