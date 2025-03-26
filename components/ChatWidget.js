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

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState({ messages: [], feedback: {} });
  const [preferences, setPreferences] = useState({ theme: "light" });
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const chatWindowRef = useRef(null);
  const [resetAnimation, setResetAnimation] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Enhanced button gradient and shadows
  const buttonGradient = {
    light: `background-image: linear-gradient(135deg, #7C3AED, #DB2777)`,
    dark: `background-image: linear-gradient(135deg, #7C3AED, #DB2777)`,
  };

  const enhancedShadow = {
    light: "0 10px 25px -5px rgba(124, 58, 237, 0.5), 0 8px 10px -6px rgba(219, 39, 119, 0.4)",
    dark: "0 10px 25px -5px rgba(124, 58, 237, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
  };

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

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    if (isChatOpen && history.messages.length === 0) {
      const welcomeMessage = {
        id: generateId(),
        text: "👋 Hey there! I'm your Abhinav Academy assistant. Ask me anything about our courses, exams, or any academic questions! 😊",
        sender: "bot",
        timestamp: Date.now(),
      };
      setHistory((prev) => ({ ...prev, messages: [welcomeMessage] }));
    }
  }, [isChatOpen, history.messages.length]);

  const theme = preferences.theme;

  return (
    <>
      {/* Chat toggle button with a completely different design */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Attention-grabbing pulsating ring effect */}
        {!isChatOpen && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0px rgba(124, 58, 237, 0.7)",
                "0 0 0 8px rgba(124, 58, 237, 0)",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        )}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ 
            [buttonGradient[theme]]: true,
            boxShadow: theme === "dark" 
              ? '0 10px 25px -5px rgba(124, 58, 237, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)' 
              : '0 10px 25px -5px rgba(124, 58, 237, 0.5), 0 8px 10px -6px rgba(219, 39, 119, 0.4)'
          }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: theme === "dark" 
              ? '0 20px 25px -5px rgba(124, 58, 237, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)' 
              : '0 20px 25px -5px rgba(124, 58, 237, 0.6), 0 10px 10px -5px rgba(219, 39, 119, 0.5)' 
          }}
          whileTap={{ scale: 0.95 }}
          animate={!isChatOpen ? { 
            scale: [1, 1.05, 1],
            transition: { 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }
          } : {}}
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          <AnimatePresence mode="wait">
            {isChatOpen ? (
              <motion.svg
                key="close"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="w-7 h-7 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="chat"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-7 h-7 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className={`fixed z-50 flex flex-col 
            ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}
            rounded-2xl overflow-hidden border 
            ${theme === "dark" ? "border-gray-800" : "border-gray-100"}`}
            style={{ 
              width: '340px', 
              height: '500px', 
              maxWidth: 'calc(100vw - 32px)', 
              maxHeight: 'calc(100vh - 100px)',
              boxShadow: theme === "dark" ? enhancedShadow.dark : enhancedShadow.light,
              position: "fixed",
              right: "24px",
              bottom: "80px",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Chat Header with improved gradient */}
            <div 
              className={`p-3 flex justify-between items-center border-b ${
                theme === "dark" ? "border-gray-800" : "border-gray-100"
              }`}
              style={theme === "dark" 
                ? { backgroundImage: 'linear-gradient(to right, #1E40AF, #4C1D95)' } // Deeper blue to purple 
                : { backgroundImage: 'linear-gradient(to right, #C7D2FE, #EDE9FE)' } // Light indigo to violet
              }
            >
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                  style={{ 
                    [buttonGradient[theme]]: true, 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="font-bold bg-clip-text text-transparent" 
                    style={{ 
                      backgroundImage: `linear-gradient(135deg, #7C3AED, #EC4899)` 
                    }}
                >
                  Abhinav Academy
                </h3>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleThemeToggle}
                  className={`p-1.5 rounded-full mr-1 transition-all duration-300 ${
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleResetChat}
                  className={`p-1.5 rounded-full mr-1 transition-all duration-300 ${
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  aria-label="Reset chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className={`p-1.5 rounded-full transition-all duration-300 ${
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  aria-label="Close chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat Window with improved background */}
            <div
              ref={chatWindowRef}
              className={`flex-grow overflow-y-auto p-4 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-50"
              }`}
              style={theme === "dark" 
                ? { backgroundImage: 'radial-gradient(circle at 80% 20%, #374151, #111827)' } 
                : { backgroundImage: 'radial-gradient(circle at 80% 20%, #FFFFFF, #F3F4F6)' }
              }
            >
              <AnimatePresence>
                {resetAnimation ? (
                  <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 0.8, rotateZ: 5 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col space-y-4"
                  >
                    {history.messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        onFeedback={(type, reason) => {
                          const questionMsg = history.messages.find(
                            (m) => m.sender === "user" && m.id === msg.id - 1
                          );
                          const question = questionMsg ? questionMsg.text : null;
                          handleFeedback(msg.id, type, reason, question, msg.text);
                        }}
                        theme={theme}
                        className={`chat-message-${msg.sender}`}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div layout className="flex flex-col space-y-4">
                    {history.messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        onFeedback={(type, reason) => {
                          const questionMsg = history.messages.find(
                            (m) => m.sender === "user" && m.id === msg.id - 1
                          );
                          const question = questionMsg ? questionMsg.text : null;
                          handleFeedback(msg.id, type, reason, question, msg.text);
                        }}
                        theme={theme}
                        className={`chat-message-${msg.sender}`}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Show suggestion chips only when suggestions are available and not typing */}
              {!isTyping && suggestions && suggestions.length > 0 && (
                <SuggestionChips
                  suggestions={suggestions}
                  onSuggestionClick={handleSuggestionClick}
                  theme={theme}
                />
              )}
              
              {/* Typing indicator with improved styling */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`flex items-center px-4 py-3 rounded-2xl rounded-tl-none ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    } w-max max-w-[75%] text-sm ${
                      theme === "dark" ? "text-gray-100" : "text-gray-800"
                    } shadow-md border ${
                      theme === "dark" ? "border-gray-700" : "border-gray-100"
                    }`}
                    style={{ 
                      boxShadow: theme === "dark" 
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
                        : '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)' 
                    }}
                  >
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full animate-bounce" 
                        style={{ 
                          animationDelay: "0ms",
                          background: `linear-gradient(135deg, #7C3AED, #EC4899)` 
                        }}></div>
                      <div className="h-2 w-2 rounded-full animate-bounce" 
                        style={{ 
                          animationDelay: "150ms",
                          background: `linear-gradient(135deg, #7C3AED, #EC4899)` 
                        }}></div>
                      <div className="h-2 w-2 rounded-full animate-bounce" 
                        style={{ 
                          animationDelay: "300ms",
                          background: `linear-gradient(135deg, #7C3AED, #EC4899)` 
                        }}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Scroll to bottom button with improved styling */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollToBottom}
                  className={`absolute bottom-20 right-4 p-2 rounded-full shadow-lg ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  } border ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                  style={{ 
                    boxShadow: theme === "dark" 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
                      : '0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -1px rgba(124, 58, 237, 0.2)' 
                  }}
                  aria-label="Scroll to bottom"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" 
                       style={{ 
                         color: theme === "dark" ? "#C4B5FD" : "#7C3AED"
                       }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
            
            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              theme={theme}
              primaryColor="#7C3AED"
              secondaryColor="#EC4899"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
