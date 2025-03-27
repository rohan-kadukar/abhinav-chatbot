"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import SuggestionChips from "./SuggestionChips";
import {
  generateId,
  getChatHistory,
  saveChatHistory,
  getChatResponse,
  getSuggestedQuestions,
  getRelevantDateReminder,
  getChatPreferences,
  saveChatPreferences,
  saveUnresolvedQuestion,
  saveFeedback,
} from "../lib/chatUtils";

const ChatWidget = ({ isWidget = false, initiallyOpen = false, isMobile = false }) => {
  const [isChatOpen, setIsChatOpen] = useState(initiallyOpen);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState({ messages: [], feedback: {} });
  const [preferences, setPreferences] = useState({ theme: "light" });
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const chatWindowRef = useRef(null);
  const [resetAnimation, setResetAnimation] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [welcomeAnimComplete, setWelcomeAnimComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pulseButton, setPulseButton] = useState(false);

  useEffect(() => {
    const savedHistory = getChatHistory();
    const savedPreferences = getChatPreferences();
    setHistory(savedHistory);
    setPreferences(savedPreferences);
    setSuggestions(getSuggestedQuestions(""));

    // Apply theme from preferences
    document.documentElement.classList.toggle(
      "dark",
      savedPreferences.theme === "dark"
    );
  }, []);

  useEffect(() => {
    saveChatHistory(history);
  }, [history]);

  useEffect(() => {
    saveChatPreferences(preferences);
    // Apply theme change
    document.documentElement.classList.toggle(
      "dark",
      preferences.theme === "dark"
    );
  }, [preferences]);

  // Modified to scroll only to the bot response message, not suggestions
  useEffect(() => {
    if (chatWindowRef.current && history.messages.length > 0) {
      // Find all bot message elements
      const botMessages =
        chatWindowRef.current.querySelectorAll(".chat-message-bot");
      if (botMessages.length > 0) {
        // Get the last bot message and scroll to it
        const lastBotMessage = botMessages[botMessages.length - 1];
        if (lastBotMessage) {
          lastBotMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }
  }, [history.messages]);

  // Check if we need to show the scroll down button
  useEffect(() => {
    const checkScrollPosition = () => {
      if (chatWindowRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
        // Show button if we're not at the bottom (with a small threshold)
        const isScrollNeeded = scrollHeight - scrollTop - clientHeight > 50;
        setShowScrollButton(isScrollNeeded);
      }
    };

    // Initial check
    checkScrollPosition();

    // Add scroll event listener
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.addEventListener("scroll", checkScrollPosition);
    }

    return () => {
      if (chatWindow) {
        chatWindow.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [history.messages]);

  // Add this effect for widget mode
  useEffect(() => {
    if (isWidget) {
      // Dispatch custom event when chat is toggled in widget mode
      const event = new CustomEvent('chatToggle', { 
        detail: { isOpen: isChatOpen }
      });
      window.dispatchEvent(event);
    }
  }, [isChatOpen, isWidget]);

  // Update isChatOpen if initiallyOpen changes
  useEffect(() => {
    if (isWidget) {
      setIsChatOpen(initiallyOpen);
    }
  }, [initiallyOpen, isWidget]);

  // Add special typing effect for bot messages
  useEffect(() => {
    const lastBotMessage = history.messages.filter(msg => msg.sender === 'bot').pop();
    
    if (lastBotMessage && !isTyping) {
      const text = lastBotMessage.text;
      setTypingText('');
      
      let i = 0;
      const typingSpeed = 30; // ms per character
      
      const typeWriter = () => {
        if (i < text.length) {
          setTypingText(text.substring(0, i + 1));
          i++;
          setTimeout(typeWriter, typingSpeed);
        }
      };
      
      // Start the typing effect after a small delay
      setTimeout(typeWriter, 100);
    }
  }, [history.messages, isTyping]);

  // Add confetti effect when user gets a successful response
  useEffect(() => {
    const lastFeedback = Object.values(history.feedback).pop();
    if (lastFeedback === 'positive') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [history.feedback]);

  // Add pulse effect to suggest user interaction
  useEffect(() => {
    if (!isTyping && history.messages.length > 1 && history.messages[history.messages.length - 1].sender === 'bot') {
      // Pulse the input button to encourage user to respond
      setTimeout(() => {
        setPulseButton(true);
        setTimeout(() => setPulseButton(false), 2000);
      }, 2000);
    }
  }, [isTyping, history.messages]);

  // Enhanced welcome message with typing effect
  useEffect(() => {
    if (isChatOpen && history.messages.length === 0) {
      const welcomeMessage = {
        id: generateId(),
        text: "👋 Hey there! I'm your Abhinav Academy assistant. Ask me anything about our courses, exams, or any academic questions! 😊",
        sender: "bot",
        timestamp: Date.now(),
      };
      
      setIsTyping(true);
      
      // Simulate typing effect for welcome message
      setTimeout(() => {
        setHistory((prev) => ({ ...prev, messages: [welcomeMessage] }));
        setIsTyping(false);
        setWelcomeAnimComplete(true);
        
        // After welcome message, show the pulsing effect on input
        setTimeout(() => {
          setPulseButton(true);
          setTimeout(() => setPulseButton(false), 2000);
        }, 1000);
      }, 1000);
    }
  }, [isChatOpen, history.messages.length]);

  // Get theme-based classes
  const getBgClass = () =>
    preferences.theme === "dark"
      ? "bg-gray-800 text-white"
      : "bg-white text-black";
  const getHeaderClass = () =>
    preferences.theme === "dark"
      ? "bg-indigo-900 text-white"
      : "shimmer text-white";
  const getButtonClass = () =>
    preferences.theme === "dark"
      ? "bg-indigo-700 hover:bg-indigo-600"
      : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600";
  const getChatBgClass = () =>
    preferences.theme === "dark" ? "bg-gray-700" : "bg-gray-50";

  // Add additional theme-based styling
  const getInputAccentClass = () =>
    preferences.theme === "dark"
      ? "from-indigo-600 to-purple-700"
      : "from-indigo-400 to-purple-500";

  const handleSendMessage = async (text) => {
    const userMessage = {
      id: generateId(),
      text,
      sender: "user",
      timestamp: Date.now(),
    };
    setHistory((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
    setIsTyping(true);

    // Add variable typing delay based on message length for more human-like interaction
    const typingDelay = Math.min(1000 + text.length * 20, 3000);

    setTimeout(() => {
      // Always use friendly enthusiastic tone
      const responseText = getChatResponse(text, history, "enthusiastic");
      const botMessage = {
        id: generateId(),
        text: responseText,
        sender: "bot",
        timestamp: Date.now(),
      };
      setHistory((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));

      // If the response has "I'm sorry" or similar terms, it might be an unresolved question
      if (
        responseText.includes("I'm sorry") ||
        responseText.includes("I couldn't find")
      ) {
        saveUnresolvedQuestion(text);
      }

      setSuggestions(getSuggestedQuestions(text));
      setIsTyping(false);
    }, typingDelay);
  };

  const handleFeedback = (
    messageId,
    feedback,
    reason = null,
    question = null,
    answer = null
  ) => {
    // Save to history for local state
    setHistory((prev) => ({
      ...prev,
      feedback: { ...prev.feedback, [messageId]: feedback },
    }));

    // Log the feedback data we're about to save
    console.log("Feedback data being saved:", {
      messageId,
      feedback,
      reason,
      question,
      answer,
    });

    // If we have both question and answer, save to feedback.json
    if (question && answer) {
      // Ensure reason is included when feedback is negative
      if (feedback === "negative" && !reason) {
        reason = "No specific reason provided";
      }

      // Save the feedback including the reason
      saveFeedback(question, answer, feedback, reason);

      // Show feedback confirmation message
      const confirmationMessage = {
        id: generateId(),
        text:
          feedback === "positive"
            ? "Thanks for your positive feedback! I'm glad I could help! 😊"
            : `Thanks for your feedback! I'll use it to improve. ${
                reason ? "Your input is valuable to us." : ""
              } 🙏`,
        sender: "bot",
        timestamp: Date.now(),
        isFeedbackConfirmation: true, // Mark as feedback confirmation
      };

      setHistory((prev) => ({
        ...prev,
        messages: [...prev.messages, confirmationMessage],
      }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
    // We'll scroll to the newly added message in the next render cycle
    setTimeout(() => {
      if (chatWindowRef.current) {
        const userMessages =
          chatWindowRef.current.querySelectorAll(".chat-message-user");
        if (userMessages.length > 0) {
          const lastUserMessage = userMessages[userMessages.length - 1];
          if (lastUserMessage) {
            lastUserMessage.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
      }
    }, 100);
  };

  const handleThemeToggle = () => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

  const handleResetChat = () => {
    setResetAnimation(true);

    setTimeout(() => {
      // Clear chat history but keep preferences
      const welcomeMessage = {
        id: generateId(),
        text: "✨ Chat reset! Let's start fresh! How can I help you today? 😊",
        sender: "bot",
        timestamp: Date.now(),
      };
      setHistory({ messages: [welcomeMessage], feedback: {} });
      setSuggestions(getSuggestedQuestions(""));
      setResetAnimation(false);
    }, 500);
  };

  return (
    <>
      {/* If not in widget mode, we show the toggle button */}
      {!isWidget && !isChatOpen && (
        <motion.button
          onClick={() => setIsChatOpen(true)}
          className={`fixed bottom-4 right-4 h-14 w-14 rounded-full ${getButtonClass()} shadow-lg flex items-center justify-center z-10`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </motion.button>
      )}

      {/* Widget is always visible in widget mode */}
      {(isChatOpen || isWidget) && (
        <motion.div
          className={`fixed ${
            isWidget ? 'inset-0' : 'bottom-4 right-4'
          } shadow-xl rounded-lg overflow-hidden ${getBgClass()} z-20 flex flex-col`}
          style={{
            width: isWidget ? '100%' : isMobile ? '90vw' : '380px',
            height: isWidget ? '100%' : isMobile ? '70vh' : '550px',
            maxWidth: isWidget ? '100%' : '90vw',
            maxHeight: isWidget ? '100%' : '80vh',
          }}
          initial={isWidget ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={isWidget ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25
          }}
        >
          {/* Confetti effect */}
          {showConfetti && (
            <div className="confetti-container" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              {Array.from({ length: 50 }).map((_, i) => (
                <div 
                  key={i}
                  className="confetti-item"
                  style={{
                    position: 'absolute',
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    borderRadius: '50%',
                    top: `-10px`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: `fall ${Math.random() * 3 + 2}s linear forwards`,
                  }}
                />
              ))}
            </div>
          )}
          
          <div
            className={`p-3 sm:p-4 ${getHeaderClass()} flex justify-between items-center`}
          >
            <div className="flex items-center flex-shrink-0">
              <motion.div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white p-1 mr-2 sm:mr-3 flex items-center justify-center shadow-lg  animate-pulse"
                animate={{ 
                  scale: welcomeAnimComplete ? [1, 1.1, 1] : 1,
                  rotate: welcomeAnimComplete ? [0, 10, -10, 0] : 0,
                  boxShadow: [
                    '0 4px 8px rgba(99, 102, 241, 0.4)',
                    '0 6px 16px rgba(139, 92, 246, 0.6)',
                    '0 4px 8px rgba(99, 102, 241, 0.4)'
                  ]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 3,
                  repeatDelay: 2
                }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="#6366F1" 
                  className="w-7 h-7"
                  animate={{
                    fill: ['rgba(99, 102, 241, 0)', 'rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0)'],
                    stroke: ['#6366F1', '#8B5CF6', '#6366F1']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    repeatDelay: 1
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </motion.svg>
              </motion.div>
              <div className="min-w-0">
                <motion.h2 
                  className={`text-base sm:text-lg font-bold truncate`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      delay: 0.2,
                      duration: 0.5
                    }
                  }}
                >
                  <span className="mr-1">Abhinav</span>
                  <motion.span
                    animate={{
                      color: [
                        'rgba(255,255,255,1)', 
                        'rgba(255,255,255,0.8)', 
                        'rgba(255,255,255,1)'
                      ]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3
                    }}
                  >
                    Academy
                  </motion.span>
                </motion.h2>
                <motion.div 
                  className="text-xs opacity-80"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0.7, 0.8],
                    transition: {
                      delay: 0.4,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                >
                  Your Academic Assistant
                </motion.div>
              </div>
            </div>
            <div className="flex items-center ml-2 flex-shrink-0">
              <button
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    theme: prev.theme === "dark" ? "light" : "dark",
                  }))
                }
                className="mr-2 p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-200 transition-all duration-300"
              >
                {preferences.theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={handleResetChat}
                className="mr-2 p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-200 transition-all duration-300 animate-[spin_4s_linear_infinite]"
                title="Reset chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
              <motion.button
                onClick={() => {
                  setIsChatOpen(false);
                  // If in widget mode, send message to parent window to close widget
                  if (isWidget && window.parent && window.parent !== window) {
                    window.parent.postMessage({
                      type: 'close',
                      isOpen: false
                    }, '*');
                    
                    // For widget mode, also try to close using window.close()
                    try {
                      window.close();
                    } catch (e) {
                      console.log("Could not close window directly:", e);
                    }
                  }
                }}
                className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-200 transition-all duration-300 relative overflow-hidden"
                whileHover={{ 
                  scale: 1.15, 
                  rotate: [0, -10, 10, -10, 0],
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.6)'
                }}
                whileTap={{ 
                  scale: 0.85,
                  boxShadow: '0 0 5px rgba(99, 102, 241, 0.9)'
                }}
                style={{ 
                  background: preferences.theme === "dark" 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' 
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: [0, 1.2, 1],
                  transition: { 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
              >
                {/* Animated ripple effect */}
                <motion.span 
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.2, 0], 
                    scale: [1, 1.5, 1.8],
                    transition: {
                      repeat: Infinity,
                      duration: 2,
                      repeatDelay: 1
                    }
                  }}
                  style={{ 
                    background: preferences.theme === "dark" 
                      ? 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(99, 102, 241, 0) 70%)' 
                      : 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0) 70%)'
                  }}
                ></motion.span>
                
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5 relative z-10"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    transition: { duration: 0.5, delay: 0.2 }
                  }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: 1,
                      transition: { duration: 0.5, delay: 0.2 }
                    }}
                  />
                </motion.svg>
              </motion.button>
            </div>
          </div>

          <div
            ref={chatWindowRef}
            className={`flex-1 p-4 overflow-y-auto chat-window ${getChatBgClass()}`}
            style={{ minHeight: "200px", position: "relative", scrollBehavior: "smooth" }}
          >
            {/* Custom styles for the chat UI */}
            <style jsx global>{`
              .chat-bubble-bot {
                position: relative;
                border-radius: 18px;
                border-bottom-left-radius: 4px;
                padding: 12px 16px;
                background: ${preferences.theme === "dark" ? "#4338ca" : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"};
                color: white;
                max-width: 80%;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                margin-bottom: 10px;
                transform-origin: bottom left;
                animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              }
              
              .chat-bubble-user {
                position: relative;
                border-radius: 18px;
                border-bottom-right-radius: 4px;
                padding: 12px 16px;
                background: ${preferences.theme === "dark" ? "#374151" : "#E5E7EB"};
                color: ${preferences.theme === "dark" ? "white" : "#111827"};
                max-width: 80%;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                margin-bottom: 10px;
                margin-left: auto;
                transform-origin: bottom right;
                animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              }
              
              @keyframes scale-in {
                0% { transform: scale(0.8); opacity: 0; }
                70% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              
              .typing-indicator {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                min-width: 60px;
              }
              
              .typing-dot {
                width: 8px;
                height: 8px;
                background-color: rgba(255, 255, 255, 0.7);
                border-radius: 50%;
                margin: 0 2px;
                animation: typing-dot 1.4s infinite ease-in-out;
              }
              
              .typing-dot:nth-child(1) { animation-delay: 0s; }
              .typing-dot:nth-child(2) { animation-delay: 0.2s; }
              .typing-dot:nth-child(3) { animation-delay: 0.4s; }
              
              @keyframes typing-dot {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              
              .pulse-button {
                animation: pulse 2s infinite;
              }
              
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
                100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
              }
              
              @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                70% { opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
              }
              
              .shimmer {
                background: linear-gradient(
                  to right,
                  #4338ca 0%,
                  #6366F1 25%,
                  #818cf8 35%,
                  #4338ca 65%
                );
                background-size: 200% auto;
                animation: shimmer 3s linear infinite;
              }
              
              @keyframes shimmer {
                to { background-position: 200% center; }
              }
              
              /* New enhanced animations */
              .chat-message-user:hover, .chat-message-bot:hover {
                transform: translateY(-2px) scale(1.01);
                transition: all 0.3s ease;
                z-index: 10;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
              }
              
              .chat-message-bot:not(:hover) {
                transition: all 0.3s ease;
              }
              
              .chat-bubble-bot:after {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
                background-size: 200% 200%;
                animation: shine 3s infinite;
                pointer-events: none;
              }
              
              @keyframes shine {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              
              .rainbow-border {
                position: relative;
              }
              
              .rainbow-border:before {
                content: '';
                position: absolute;
                inset: -2px;
                z-index: -1;
                border-radius: inherit;
                background: linear-gradient(
                  45deg, 
                  #ff1493, #ff7f50, #ffd700, #adff2f, 
                  #1e90ff, #8a2be2, #ff1493
                );
                background-size: 400% 400%;
                animation: rainbow 8s linear infinite;
                opacity: 0;
                transition: opacity 0.3s ease;
              }
              
              .rainbow-border:hover:before {
                opacity: 1;
              }
              
              @keyframes rainbow {
                0% { background-position: 0 0; }
                100% { background-position: 400% 0; }
              }
              
              .ripple {
                position: relative;
                overflow: hidden;
              }
              
              .ripple:after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
              }
              
              .ripple:active:after {
                width: 300px;
                height: 300px;
                opacity: 1;
                transition: width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out;
              }
              
              .satisfying-pop {
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              .satisfying-pop:active {
                transform: scale(0.85);
              }
              
              /* Make scrollbar attractive */
              .chat-window::-webkit-scrollbar {
                width: 6px;
              }
              
              .chat-window::-webkit-scrollbar-track {
                background: ${preferences.theme === "dark" ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
                border-radius: 10px;
              }
              
              .chat-window::-webkit-scrollbar-thumb {
                background: ${preferences.theme === "dark" ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.5)'};
                border-radius: 10px;
                transition: all 0.3s ease;
              }
              
              .chat-window::-webkit-scrollbar-thumb:hover {
                background: ${preferences.theme === "dark" ? 'rgba(139, 92, 246, 0.8)' : 'rgba(99, 102, 241, 0.8)'};
              }

              .feedback-buttons {
                opacity: 1 !important; /* Always visible */
                transform: scale(1) !important;
                background: ${preferences.theme === "dark" ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
                border-radius: 16px;
                padding: 4px 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                z-index: 10;
              }

              .feedback-button {
                background: transparent;
                border: none;
                color: ${preferences.theme === "dark" ? 'rgba(255, 255, 255, 0.7)' : 'rgba(75, 85, 99, 0.7)'};
                padding: 4px;
                margin: 0 2px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .feedback-button:hover {
                color: ${preferences.theme === "dark" ? 'rgba(255, 255, 255, 1)' : 'rgba(75, 85, 99, 1)'};
                background: ${preferences.theme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
              }

              .feedback-button.active {
                color: ${preferences.theme === "dark" ? '#818cf8' : '#6366F1'};
              }
            `}</style>

            {history.messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                theme={preferences.theme}
                className={`chat-message-${message.sender}`}
                onFeedback={(feedback, reason) =>
                  message.sender === "bot"
                    ? handleFeedback(
                        message.id,
                        feedback,
                        reason,
                        history.messages[index - 1]?.text,
                        message.text
                      )
                    : undefined
                }
              />
            ))}
            {isTyping && (
              <div className="flex w-full mb-4 justify-start">
                <div
                  className={`chat-bubble-bot typing-indicator ${
                    preferences.theme === "dark" ? "bg-gray-600" : ""
                  }`}
                >
                  <div className="flex space-x-1">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestion chips shown */}
            {!isTyping && history.messages.length > 0 && (
              <SuggestionChips
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                theme={preferences.theme}
              />
            )}
          </div>

          {/* Scroll button positioned right above input */}
          <div
            className={`w-full ${
              preferences.theme === "dark"
                ? "bg-gray-800 border-t border-gray-700"
                : "bg-white border-t border-gray-200"
            } relative`}
          >
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full ${
                    preferences.theme === "dark"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600"
                      : "bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600"
                  } text-white rounded-full p-2 shadow-lg z-40 border-2 border-white/30 ripple satisfying-pop rainbow-border w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100`}
                  whileHover={{
                    scale: 1.15,
                    y: -2,
                    boxShadow: "0 0 15px rgba(99, 102, 241, 0.6)",
                  }}
                  whileTap={{ scale: 0.85 }}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{
                    opacity: 0.8,
                    scale: [0, 1.2, 1],
                    y: 0,
                    boxShadow: [
                      "0 0 0 0 rgba(99, 102, 241, 0)",
                      "0 0 0 5px rgba(99, 102, 241, 0.3)",
                      "0 0 0 0 rgba(99, 102, 241, 0)",
                    ],
                  }}
                  exit={{ opacity: 0, scale: 0, y: 0 }}
                  transition={{
                    duration: 0.3,
                    scale: { duration: 0.4 },
                    boxShadow: {
                      repeat: Infinity,
                      duration: 1.5,
                      repeatDelay: 0.5,
                    },
                  }}
                  onClick={() => {
                    if (chatWindowRef.current) {
                      chatWindowRef.current.scrollTop =
                        chatWindowRef.current.scrollHeight;
                      setShowScrollButton(false);
                    }
                  }}
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ y: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <polyline points="7 13 12 18 17 13"></polyline>
                    <polyline points="7 6 12 11 17 6"></polyline>
                  </motion.svg>
                </motion.button>
              )}
            </AnimatePresence>
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              theme={preferences.theme}
              pulseEffect={pulseButton}
            />
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ChatWidget;
