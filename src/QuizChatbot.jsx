import React, { useState, useEffect, useRef } from 'react';
import './QuizChatbot.css';

export default function QuizChatbot({ quiz, setQuiz, questions, setQuestions, setStep }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Quiz Assistant. I can help you build your quiz. Let's start! What is the title of your quiz?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [chatState, setChatState] = useState('GET_TITLE'); 
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    answer: ""
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
      setChatState('GET_TITLE');
      setQuiz({ title: "", description: "" });
      setQuestions([]);
      addMessage("Okay, let's start over. What is the title of your quiz?", 'bot');
      return;
    }

    if (lowerText.startsWith("change title to ")) {
        const newTitle = text.substring(16);
        setQuiz(prev => ({ ...prev, title: newTitle }));
        addMessage(`Updated title to: "${newTitle}"`, 'bot');
        return;
    }

    if (lowerText.startsWith("change description to ")) {
        const newDesc = text.substring(22);
        setQuiz(prev => ({ ...prev, description: newDesc }));
        addMessage(`Updated description to: "${newDesc}"`, 'bot');
        return;
    }

    // Allow modifying the current question being built
    if (lowerText.startsWith("change question to ")) {
        const newText = text.substring(19);
        setCurrentQuestion(prev => ({ ...prev, text: newText }));
        addMessage(`Updated question text to: "${newText}". Continue with options?`, 'bot');
        return;
    }

    // State machine
    switch (chatState) {
      case 'GET_TITLE':
        setQuiz(prev => ({ ...prev, title: text }));
        addMessage("Great! Now, give me a short description for the quiz.", 'bot');
        setChatState('GET_DESCRIPTION');
        break;

      case 'GET_DESCRIPTION':
        setQuiz(prev => ({ ...prev, description: text }));
        addMessage("Awesome. Let's add the first question. What is the question text?", 'bot');
        setChatState('GET_QUESTION_TEXT');
        setStep(2); // Move UI to questions step
        break;

      case 'GET_QUESTION_TEXT':
        setCurrentQuestion(prev => ({ ...prev, text: text }));
        addMessage("Okay. What is Option A?", 'bot');
        setChatState('GET_OPTION_A');
        break;

      case 'GET_OPTION_A':
        updateOption(0, text);
        addMessage("What is Option B?", 'bot');
        setChatState('GET_OPTION_B');
        break;

      case 'GET_OPTION_B':
        updateOption(1, text);
        addMessage("What is Option C?", 'bot');
        setChatState('GET_OPTION_C');
        break;

      case 'GET_OPTION_C':
        updateOption(2, text);
        addMessage("What is Option D?", 'bot');
        setChatState('GET_OPTION_D');
        break;

      case 'GET_OPTION_D':
        updateOption(3, text);
        addMessage("Which option is correct? (A, B, C, or D)", 'bot');
        setChatState('GET_ANSWER');
        break;

      case 'GET_ANSWER':
        const answer = text.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(answer)) {
          const finalQuestion = { ...currentQuestion, answer };
          setQuestions(prev => [...prev, finalQuestion]);
          
          // Reset current question
          setCurrentQuestion({ text: "", options: ["", "", "", ""], answer: "" });
          
          addMessage("Question added! Do you want to add another question? (Type 'yes' or the next question text, or 'no' to finish)", 'bot');
          setChatState('CONFIRM_NEXT');
        } else {
          addMessage("Please enter a valid option: A, B, C, or D.", 'bot');
        }
        break;

      case 'CONFIRM_NEXT':
        if (lowerText === 'no' || lowerText.includes('finish') || lowerText.includes('done')) {
          addMessage("Quiz creation complete! Please review your quiz and click 'Save Quiz' in the main window.", 'bot');
          setStep(3); // Move to review step
          setChatState('IDLE');
        } else if (lowerText === 'yes') {
             addMessage("Okay, what is the next question text?", 'bot');
             setChatState('GET_QUESTION_TEXT');
        } else {
            // Assume they typed the question text directly
            setCurrentQuestion(prev => ({ ...prev, text: text }));
            addMessage("Okay. What is Option A?", 'bot');
            setChatState('GET_OPTION_A');
        }
        break;
        
      case 'IDLE':
        if (lowerText.includes("add question")) {
             addMessage("Okay, what is the question text?", 'bot');
             setChatState('GET_QUESTION_TEXT');
             setStep(2);
        } else {
            addMessage("I'm listening. You can say 'add question' to add more, or modify existing questions manually.", 'bot');
        }
        break;

      default:
        addMessage("I'm not sure what you mean. Let's continue.", 'bot');
    }
  };

  const updateOption = (index, text) => {
    setCurrentQuestion(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = text;
      return { ...prev, options: newOptions };
    });
  };

  if (!isOpen) {
    return (
      <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
        <span role="img" aria-label="chat">💬</span>
      </button>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-info">
            <div className="bot-avatar-header">
                <span role="img" aria-label="robot">🤖</span>
                <div className="online-indicator"></div>
            </div>
            <div className="header-text">
                <h3>LeadBot</h3>
                <span className="status">Online Now</span>
            </div>
        </div>
        <div className="header-actions">
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrapper ${msg.sender}`}>
            {msg.sender === 'bot' && (
                <div className="bot-avatar-message">
                    <span role="img" aria-label="robot">🤖</span>
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
