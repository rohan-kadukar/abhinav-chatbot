'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSendMessage, disabled, theme, pulseEffect = false, loading = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Focus input on component mount if not loading
  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && !loading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const getBgColor = () => 
    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  
  const getHoverBgColor = () => 
    theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200';
  
  const getPlaceholderColor = () =>
    theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500';
  
  const getButtonBgColor = () =>
    theme === 'dark' 
      ? 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800' 
      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700';

  return (
    <form onSubmit={handleSubmit} className="px-3 pt-3 pb-1">
      <div className={`relative flex items-center ${isFocused ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''} rounded-full transition-all duration-300`}>
        <motion.input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder={loading ? "AI is loading..." : disabled ? "AI is thinking..." : "Ask me anything..."}
          className={`w-full py-2 pl-4 pr-16 ${getBgColor()} ${getPlaceholderColor()} rounded-full border ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          } focus:outline-none transition-all duration-300 ${loading || disabled ? 'cursor-not-allowed opacity-70' : ''}`}
          style={{
            boxShadow: pulseEffect ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileTap={{ scale: 0.98 }}
          animate={
            pulseEffect
              ? {
                  boxShadow: [
                    '0 0 0 0 rgba(99, 102, 241, 0.7)',
                    '0 0 0 10px rgba(99, 102, 241, 0)',
                    '0 0 0 0 rgba(99, 102, 241, 0)',
                  ],
                }
              : {}
          }
          transition={{
            boxShadow: {
              repeat: 5,
              duration: 2,
            },
          }}
        />
        <motion.button
          type="submit"
          disabled={!message.trim() || disabled || loading}
          className={`absolute right-1.5 w-9 h-9 flex items-center justify-center ${getButtonBgColor()} text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={pulseEffect ? { scale: [1, 1.1, 1] } : {}}
          transition={{ scale: { repeat: 5, duration: 1 } }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </motion.button>
      </div>
      
      {/* Subtle hint text */}
      <div className="text-xs text-center mt-1 opacity-60">
        {loading ? 'Loading AI...' : message.length > 0 ? 'Press Enter to send' : 'Ask any question about Abhinav Academy'}
      </div>
    </form>
  );
};

export default ChatInput;