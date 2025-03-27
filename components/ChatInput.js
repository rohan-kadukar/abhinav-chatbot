import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSendMessage, disabled, theme }) => {
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
    ? 'bg-gray-800 text-white border-gray-700 focus:border-indigo-500' 
    : 'bg-white text-gray-700 border-gray-200 focus:border-indigo-400';
  
  const getButtonClass = () => theme === 'dark' 
    ? 'bg-indigo-700 hover:bg-indigo-600 disabled:bg-gray-700' 
    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400';

  return (
    <div className={`px-4 py-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder={disabled ? "AI is thinking..." : "Ask me anything..."}
          className={`w-full ${getInputClass()} text-sm py-2.5 pr-10 pl-4 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 border transition-all`}
          disabled={disabled}
        />
        
        <motion.button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`absolute right-2 ${getButtonClass()} text-white p-2 rounded-full transition-all ${!message.trim() || disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          whileHover={!disabled && message.trim() ? { scale: 1.1 } : {}}
          whileTap={!disabled && message.trim() ? { scale: 0.9 } : {}}
          animate={isTyping ? { rotate: [0, 15, 0, -15, 0] } : {}}
          transition={isTyping ? { duration: 0.5, repeat: 0 } : {}}
        >
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
        </motion.button>
      </form>
    </div>
  );
};

export default ChatInput; 