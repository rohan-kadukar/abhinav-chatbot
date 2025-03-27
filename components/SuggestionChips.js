import React from 'react';
import { motion } from 'framer-motion';

const SuggestionChips = ({ suggestions, onSuggestionClick, theme }) => {
  if (!suggestions || suggestions.length === 0) return null;

  const getChipClass = () => theme === 'dark' 
    ? 'bg-gradient-to-r from-indigo-800 to-purple-900 hover:from-indigo-700 hover:to-purple-800 text-white border border-indigo-600' 
    : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200 shadow-sm';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mt-3 mb-2">
      <div className="text-xs text-gray-500 mb-1 font-medium flex items-center">
        {theme === 'dark' ? 
          <><span className="animate-pulse mr-1">✨</span> Popular questions:</> : 
          <><span className="animate-pulse mr-1">💡</span> Popular questions:</>}
      </div>
      <motion.div 
        className="flex flex-wrap gap-1.5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className={`${getChipClass()} text-xs px-2 py-1 rounded-full transition-all duration-200 cursor-pointer shadow-md`}
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 4px 8px rgba(99, 102, 241, 0.25)" }}
            whileTap={{ scale: 0.95 }}
            variants={item}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default SuggestionChips; 