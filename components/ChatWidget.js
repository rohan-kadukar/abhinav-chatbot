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

const ChatWidget = ({ isWidget = false, initiallyOpen = false }) => {
  const [isChatOpen, setIsChatOpen] = useState(initiallyOpen);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState({ messages: [], feedback: {} });
  const [preferences, setPreferences] = useState({ theme: "light" });
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const chatWindowRef = useRef(null);
  const [resetAnimation, setResetAnimation] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

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
            width: isWidget ? '100%' : '350px',
            height: isWidget ? '100%' : '500px',
            maxWidth: isWidget ? '100%' : '90vw',
            maxHeight: isWidget ? '100%' : '80vh',
          }}
          initial={isWidget ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={isWidget ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`p-4 ${getHeaderClass()} flex justify-between items-center`}
          >
            <h2 className={`text-lg font-bold`}>Abhinav Academy</h2>
            <div className="flex items-center">
              <button
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    theme: prev.theme === "dark" ? "light" : "dark",
                  }))
                }
                className="mr-2 p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-200"
              >
                {preferences.theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={handleResetChat}
                className="mr-2 p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-200"
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
              {!isWidget && (
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-200"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div
            ref={chatWindowRef}
            className={`flex-1 p-4 overflow-y-auto chat-window ${getChatBgClass()}`}
            style={{ minHeight: "200px", position: "relative" }}
          >
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
            />
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ChatWidget;
