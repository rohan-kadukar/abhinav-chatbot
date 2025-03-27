'use client';
import { useEffect, useState } from 'react';
import ChatWidget from "../../components/ChatWidget";

export default function WidgetPage() {
  const [isInitiallyOpen, setIsInitiallyOpen] = useState(false);

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

  return (
    <main style={{ overflow: 'hidden', height: '100vh', width: '100%' }}>
      <ChatWidget isWidget={true} initiallyOpen={isInitiallyOpen} />
    </main>
  );
} 