import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatMessage = ({ message, onFeedback, theme, className }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('');
  const { id, text, sender, timestamp, isFeedbackConfirmation } = message;
  const isUser = sender === 'user';
  
  // Skip feedback for confirmation messages - check flag or fallback to text check
  const isConfirmationMessage = isFeedbackConfirmation || (!isUser && text.startsWith("Thanks for your feedback"));
  
  const handleFeedback = (type) => {
    if (!feedbackGiven && onFeedback && !isConfirmationMessage) {
      if (type === 'negative') {
        setShowFeedbackForm(true);
        setFeedbackType(type);
      } else {
        // If we're switching from negative to positive, close the form
        if (showFeedbackForm) {
          setShowFeedbackForm(false);
        }
        onFeedback(type);
        setFeedbackGiven(true);
        setFeedbackType(type);
      }
    }
  };

  const submitNegativeFeedback = () => {
    if (onFeedback && feedbackType === 'negative') {
      // Always pass the feedback reason, even if it's empty
      const reason = feedbackReason.trim() || "No specific feedback provided";
      onFeedback(feedbackType, reason);
      setFeedbackGiven(true);
      setShowFeedbackForm(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBubbleClass = () => {
    if (isUser) {
      return theme === 'dark' 
        ? 'bg-gradient-to-r from-indigo-800 to-purple-700 text-white shadow-lg' 
        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg';
    } else {
      return theme === 'dark' 
        ? 'bg-gray-700 text-white border border-gray-600 shadow-md' 
        : 'bg-white text-gray-800 border border-gray-200 shadow-md';
    }
  };

  return (
    <motion.div 
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} ${className || ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => !isUser && setIsHovered(true)}
      onMouseLeave={() => !isUser && setIsHovered(false)}
    >
      <div className={`rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} px-3 py-2.5 max-w-xs md:max-w-sm ${getBubbleClass()} text-sm`}>
        <div className="message-text">{text}</div>
        
        {/* Footer with timestamp and feedback */}
        <div className="text-xs opacity-70 mt-1 flex justify-between items-center h-6">
          <span>{formatTime(timestamp)}</span>
          
          {/* Feedback options - always reserve the space */}
          <AnimatePresence mode="wait">
            {!isUser && onFeedback && !feedbackGiven && !isConfirmationMessage && (isHovered || !isHovered || showFeedbackForm) ? (
              <motion.div 
                key="feedback-options"
                className="flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.button 
                  onClick={() => handleFeedback('positive')} 
                  className={`attention-glow flex items-center justify-center text-xs p-1 rounded-full ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Helpful"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </motion.button>
                <motion.button 
                  onClick={() => handleFeedback('negative')}
                  className={`attention-glow flex items-center justify-center text-xs p-1 rounded-full ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Not helpful"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                </motion.button>
              </motion.div>
            ) : !isUser && feedbackGiven && !isConfirmationMessage ? (
              <motion.div 
                key="feedback-given"
                className="flex items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {feedbackType === 'positive' ? (
                  <span className="text-green-500 text-xs font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Thanks 😊
                  </span>
                ) : (
                  <span className="text-indigo-500 text-xs font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sent
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty-space" className="w-10" />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showFeedbackForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-2 border-t"
            >
              <div className="text-xs font-medium mb-2">
                <span className="text-red-500">*</span> Please tell us what was missing or incorrect:
              </div>
              <div className="flex flex-col space-y-2">
                <textarea
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  className={`text-sm p-2 rounded-lg border transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows="2"
                  placeholder="Your feedback helps us improve..."
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <motion.button
                    onClick={() => setShowFeedbackForm(false)}
                    className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={submitNegativeFeedback}
                    className={`text-xs px-2 py-1 rounded-full ${feedbackReason.trim() ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    whileHover={feedbackReason.trim() ? { scale: 1.05 } : {}}
                    whileTap={feedbackReason.trim() ? { scale: 0.95 } : {}}
                    disabled={!feedbackReason.trim()}
                  >
                    Submit Feedback
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 italic mt-1">
                  Feedback required to help us improve our responses
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatMessage; 