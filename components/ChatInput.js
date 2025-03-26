import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSendMessage, disabled, theme, primaryColor = "#7C3AED", secondaryColor = "#EC4899" }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const getInputClass = () => theme === 'dark' 
    ? 'bg-gray-800 text-gray-100 border-gray-700 focus:border-violet-500 placeholder-gray-500' 
    : 'bg-white text-gray-800 border-gray-200 focus:border-violet-500 placeholder-gray-400';
  
  const getButtonGradient = () => theme === 'dark' 
    ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
    : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;

  const getButtonShadow = () => theme === 'dark'
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
    : '0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -1px rgba(219, 39, 119, 0.2)';

  return (
    <div 
      className={`px-4 py-3 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}
      style={{ 
        background: theme === 'dark' 
        ? 'linear-gradient(to right, #1E40AF, #4C1D95)' 
        : 'linear-gradient(to right, #C7D2FE, #EDE9FE)'
      }}
    >
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder={disabled ? "AI is thinking..." : "Ask me anything..."}
          className={`w-full ${getInputClass()} text-sm py-3 pr-12 pl-4 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400 border transition-all`}
          disabled={disabled}
          style={{ 
            boxShadow: theme === 'dark' 
              ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)' 
              : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
          }}
        />
        
        <motion.button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`absolute right-2 text-white p-2.5 rounded-full transition-all ${!message.trim() || disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{
            background: getButtonGradient(),
            boxShadow: getButtonShadow()
          }}
          whileHover={!disabled && message.trim() ? { 
            scale: 1.1, 
            boxShadow: '0 4px 8px -1px rgba(124, 58, 237, 0.4), 0 2px 6px -1px rgba(219, 39, 119, 0.3)' 
          } : {}}
          whileTap={!disabled && message.trim() ? { scale: 0.9 } : {}}
          animate={isTyping ? { rotate: [0, 15, 0, -15, 0] } : {}}
          transition={isTyping ? { duration: 0.5, repeat: 0 } : {}}
        >
          {message.trim() ? (
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              animate={isTyping && !disabled ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </motion.svg>
          ) : (
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              animate={isTyping && !disabled ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </motion.svg>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ChatInput; 