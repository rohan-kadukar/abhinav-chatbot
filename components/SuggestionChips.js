import React from 'react';
import { motion } from 'framer-motion';

const SuggestionChips = ({ suggestions, onSuggestionClick, theme }) => {
  if (!suggestions || suggestions.length === 0) return null;

  const getChipStyle = () => {
    const baseStyle = {
      boxShadow: theme === 'dark' 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px -1px rgba(124, 58, 237, 0.15), 0 2px 4px -1px rgba(124, 58, 237, 0.1)',
      transition: 'all 0.3s ease'
    };
    
    if (theme === 'dark') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #4338CA, #6D28D9)',
        border: '1px solid #4C1D95',
        color: '#EDE9FE'
      };
    } else {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #EEF2FF, #DDD6FE)',
        border: '1px solid #C4B5FD',
        color: '#4C1D95'
      };
    }
  };

  const hoverStyle = {
    scale: 1.05,
    y: -2,
    boxShadow: theme === 'dark'
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
      : '0 10px 15px -3px rgba(124, 58, 237, 0.3), 0 4px 6px -2px rgba(124, 58, 237, 0.2)'
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const getRandomDelay = () => Math.random() * 0.5;

  return (
    <div className="mt-4 mb-2">
      <div className="text-xs mb-2 font-semibold flex items-center"
           style={{ 
             color: theme === 'dark' ? '#C4B5FD' : '#6D28D9',
             textShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
           }}>
        {theme === 'dark' ? 
          <><span className="animate-pulse mr-1">✨</span> Popular questions:</> : 
          <><span className="animate-pulse mr-1">💡</span> Popular questions:</>}
      </div>
      <motion.div 
        className="flex flex-wrap gap-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-xs font-medium px-3 py-2 rounded-full transition-all duration-300 cursor-pointer"
            style={getChipStyle()}
            whileHover={hoverStyle}
            whileTap={{ scale: 0.95 }}
            variants={item}
            custom={index}
            animate={{
              y: [0, -2, 0],
              transition: {
                delay: getRandomDelay(),
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror"
              }
            }}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default SuggestionChips; 