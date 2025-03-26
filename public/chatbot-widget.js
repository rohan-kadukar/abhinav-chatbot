(function() {
  // Configuration - Replace with your actual deployment URL
  const CHATBOT_URL = 'https://your-deployment-url.com';
  
  // Default settings
  const DEFAULT_SETTINGS = {
    title: 'Abhinav Academy Chatbot',
    position: 'right', // 'right' or 'left'
    primaryColor: '#4f46e5', // indigo-600
    secondaryColor: '#7e22ce', // purple-700
    accentColor: '#4f46e5', // indigo-600
    iconColor: '#ffffff', // white
    allowDarkMode: true,
    theme: 'light', // 'light' or 'dark'
    welcomeMessage: '👋 Hey there! I\'m your Abhinav Academy assistant. Ask me anything about our courses, exams, or any academic questions! 😊'
  };

  // Create and inject the iframe
  function injectChatbot(settings) {
    // Merge with default settings
    const config = { ...DEFAULT_SETTINGS, ...settings };

    // Create container div
    const container = document.createElement('div');
    container.id = 'abhinav-academy-chatbot-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style[config.position] = '20px'; 
    container.style.zIndex = '9999';
    container.style.overflow = 'hidden';
    container.style.width = '60px';
    container.style.height = '60px';
    container.style.transition = 'all 0.3s ease';

    // Create the iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'abhinav-academy-chatbot-iframe';
    iframe.title = 'Abhinav Academy Chatbot';
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.borderRadius = '50%';
    iframe.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    iframe.style.transition = 'all 0.3s ease';
    
    // Build the URL with query parameters for configuration
    const queryParams = new URLSearchParams({
      title: config.title,
      position: config.position,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      accentColor: config.accentColor,
      iconColor: config.iconColor,
      allowDarkMode: config.allowDarkMode,
      theme: config.theme,
      welcomeMessage: config.welcomeMessage,
      embedded: 'true'
    });
    
    iframe.src = `${CHATBOT_URL}/embed?${queryParams.toString()}`;
    
    // Append iframe to container
    container.appendChild(iframe);
    
    // Append container to body
    document.body.appendChild(container);
    
    // Setup message listener
    window.addEventListener('message', handleChatbotMessages);
  }

  // Handle messages from the iframe
  function handleChatbotMessages(event) {
    // Verify the origin (replace with your actual domain)
    if (event.origin !== CHATBOT_URL) return;
    
    const container = document.getElementById('abhinav-academy-chatbot-container');
    const iframe = document.getElementById('abhinav-academy-chatbot-iframe');
    
    if (!container || !iframe) return;
    
    // Handle different message types
    switch (event.data.type) {
      case 'CHATBOT_OPEN':
        // Expand the container
        container.style.width = '360px';
        container.style.height = '520px';
        iframe.style.borderRadius = '16px';
        break;
        
      case 'CHATBOT_CLOSE':
        // Collapse the container
        container.style.width = '60px';
        container.style.height = '60px';
        iframe.style.borderRadius = '50%';
        break;
        
      case 'CHATBOT_READY':
        // The chatbot is ready to receive configuration
        iframe.contentWindow.postMessage({
          type: 'CHATBOT_CONFIG',
          config: window.abhinavAcademyChatbotSettings || {}
        }, CHATBOT_URL);
        break;
    }
  }
  
  // Initialize the chatbot
  function init() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      injectChatbot(window.abhinavAcademyChatbotSettings || {});
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        injectChatbot(window.abhinavAcademyChatbotSettings || {});
      });
    }
  }

  // Run initialization
  init();
})(); 