'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FloatingChatWidget from '../../components/FloatingChatWidget';

export default function EmbedPage() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState({
    title: searchParams.get('title') || 'Abhinav Academy Chatbot',
    position: searchParams.get('position') || 'right',
    primaryColor: searchParams.get('primaryColor') || '#4f46e5',
    secondaryColor: searchParams.get('secondaryColor') || '#7e22ce',
    accentColor: searchParams.get('accentColor') || '#4f46e5',
    iconColor: searchParams.get('iconColor') || '#ffffff',
    allowDarkMode: searchParams.get('allowDarkMode') !== 'false',
    theme: searchParams.get('theme') || 'light',
    welcomeMessage: searchParams.get('welcomeMessage') || '👋 Hey there! I\'m your Abhinav Academy assistant. Ask me anything about our courses, exams, or any academic questions! 😊',
  });
  
  const [isEmbedded, setIsEmbedded] = useState(searchParams.get('embedded') === 'true');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Handle messages from parent window
  useEffect(() => {
    // Only run this in iframe context
    if (!isEmbedded) return;
    
    function handleParentMessage(event) {
      // Verify origin (in production, you would check origin more strictly)
      if (event.data.type === 'CHATBOT_CONFIG') {
        // Update config from parent
        if (event.data.config) {
          setConfig(prev => ({
            ...prev,
            ...event.data.config
          }));
        }
      }
    }
    
    // Notify the parent that the chatbot is ready
    window.parent.postMessage({ type: 'CHATBOT_READY' }, '*');
    
    // Listen for messages from parent
    window.addEventListener('message', handleParentMessage);
    
    return () => {
      window.removeEventListener('message', handleParentMessage);
    };
  }, [isEmbedded]);
  
  // Handle chat open/close and notify parent
  useEffect(() => {
    if (!isEmbedded) return;
    
    if (isChatOpen) {
      window.parent.postMessage({ type: 'CHATBOT_OPEN' }, '*');
    } else {
      window.parent.postMessage({ type: 'CHATBOT_CLOSE' }, '*');
    }
  }, [isChatOpen, isEmbedded]);
  
  const handleChatToggle = (isOpen) => {
    setIsChatOpen(isOpen);
  };
  
  // Custom wrapper for FloatingChatWidget in embedded mode
  if (isEmbedded) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <FloatingChatWidget 
          {...config}
          initialTheme={config.theme}
          onChatToggle={handleChatToggle}
          isInitiallyOpen={true}
        />
      </div>
    );
  }
  
  // Regular standalone mode
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <FloatingChatWidget 
        {...config}
        initialTheme={config.theme}
      />
    </main>
  );
} 