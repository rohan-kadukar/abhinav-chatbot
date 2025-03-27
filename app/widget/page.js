'use client';
import { useEffect, useState } from 'react';
import ChatWidget from "../../components/ChatWidget";

export default function WidgetPage() {
  const [isInitiallyOpen, setIsInitiallyOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event) => {
      // Check if the message is the initial state
      if (event.data && event.data.type === 'initialState') {
        setIsInitiallyOpen(event.data.isOpen);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send resize messages to parent window
  useEffect(() => {
    const handleChatToggle = (isOpen) => {
      // Send message to parent window about chat state
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ 
          type: 'resize',
          isOpen
        }, '*');
      }
    };

    // Subscribe to a custom event from ChatWidget
    window.addEventListener('chatToggle', (e) => handleChatToggle(e.detail.isOpen));
    
    return () => {
      window.removeEventListener('chatToggle', handleChatToggle);
    };
  }, []);

  // Set document to optimal viewport for iframed content
  useEffect(() => {
    // Meta viewport tag for better mobile handling
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);

    // Prevent scrolling in iframe
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.head.removeChild(viewportMeta);
    };
  }, []);

  return (
    <main style={{ 
      overflow: 'hidden', 
      height: '100vh', 
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 0,
      margin: 0,
      border: 'none',
      borderRadius: 'inherit',
      backgroundColor: 'transparent'
    }}>
      <ChatWidget 
        isWidget={true} 
        initiallyOpen={isInitiallyOpen} 
        isMobile={isMobile}
      />
    </main>
  );
} 