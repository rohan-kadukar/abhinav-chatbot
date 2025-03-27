(function() {
  // Get configuration if available
  const config = window.ABHINAV_CHATBOT_CONFIG || {};
  const position = config.position || 'right';
  const initialOpen = config.initialOpen || false;
  const widgetSize = config.size || 'standard'; // 'small', 'standard', 'large'
  
  // Get dimensions based on size
  const getDimensions = (size) => {
    switch(size) {
      case 'small':
        return { closed: { width: 60, height: 60 }, open: { width: 320, height: 450 } };
      case 'large':
        return { closed: { width: 80, height: 80 }, open: { width: 420, height: 600 } };
      case 'standard':
      default:
        return { closed: { width: 70, height: 70 }, open: { width: 380, height: 550 } };
    }
  };
  
  const dimensions = getDimensions(widgetSize);
  
  // Create styles for the chatbot
  const createStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0.8; }
      }
      
      @keyframes bounce-in {
        0% { transform: scale(0); }
        50% { transform: scale(1.1); }
        70% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      
      @keyframes slide-up {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      #abhinav-academy-chatbot-button {
        position: fixed;
        bottom: 20px;
        ${position}: 20px;
        width: ${dimensions.closed.width}px;
        height: ${dimensions.closed.height}px;
        border-radius: 50%;
        background: linear-gradient(45deg, #6366F1, #8B5CF6);
        box-shadow: 0 5px 20px rgba(99, 102, 241, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 999998;
        transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);
        animation: bounce-in 0.5s ease forwards;
      }
      
      #abhinav-academy-chatbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 5px 25px rgba(99, 102, 241, 0.6);
      }
      
      #abhinav-academy-chatbot-button::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(45deg, #6366F1, #8B5CF6);
        z-index: -1;
        animation: pulse-ring 2s ease infinite;
      }
      
      #abhinav-academy-chatbot-icon {
        width: 55%;
        height: 55%;
        fill: white;
        transition: transform 0.3s ease;
      }
      
      #abhinav-academy-chatbot-button:hover #abhinav-academy-chatbot-icon {
        transform: scale(1.2);
      }
      
      #abhinav-academy-chatbot-iframe {
        position: fixed;
        bottom: 20px;
        ${position}: 20px;
        width: ${initialOpen ? dimensions.open.width : dimensions.closed.width}px;
        height: ${initialOpen ? dimensions.open.height : dimensions.closed.height}px;
        border: none;
        border-radius: ${initialOpen ? '16px' : '50%'};
        box-shadow: 0 5px 40px rgba(0, 0, 0, 0.25);
        z-index: 999999;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        animation: ${initialOpen ? 'slide-up' : 'bounce-in'} 0.5s ease forwards;
        overflow: hidden;
        background-color: white;
      }
      
      #abhinav-academy-chatbot-iframe.open {
        width: ${dimensions.open.width}px;
        height: ${dimensions.open.height}px;
        border-radius: 16px;
      }
      
      @media (max-width: 480px) {
        #abhinav-academy-chatbot-iframe.open {
          width: 90vw;
          height: 70vh;
          ${position}: 5vw;
          bottom: 15vh;
        }
      }
      
      .abhinav-academy-chatbot-notification {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 22px;
        height: 22px;
        background-color: #EF4444;
        border-radius: 50%;
        color: white;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        animation: bounce-in 0.5s ease forwards;
      }
    `;
    document.head.appendChild(styleElement);
  };
  
  // Create widget container
  createStyles();
  
  // Create button if not initially open
  if (!initialOpen) {
    const chatButton = document.createElement('div');
    chatButton.id = 'abhinav-academy-chatbot-button';
    document.body.appendChild(chatButton);
    
    // Add chat icon
    const chatIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chatIcon.id = 'abhinav-academy-chatbot-icon';
    chatIcon.setAttribute('viewBox', '0 0 24 24');
    chatIcon.setAttribute('fill', 'none');
    chatIcon.setAttribute('stroke', 'currentColor');
    chatIcon.setAttribute('stroke-width', '2');
    chatIcon.setAttribute('stroke-linecap', 'round');
    chatIcon.setAttribute('stroke-linejoin', 'round');
    
    const chatIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    chatIconPath.setAttribute('d', 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z');
    chatIcon.appendChild(chatIconPath);
    chatButton.appendChild(chatIcon);
    
    // Add notification indicator
    const notification = document.createElement('div');
    notification.className = 'abhinav-academy-chatbot-notification';
    notification.textContent = '1';
    chatButton.appendChild(notification);
  }

  // Load the widget iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'abhinav-academy-chatbot-iframe';
  iframe.src = 'https://your-vercel-deployment-url.vercel.app/widget';
  iframe.style.opacity = '0';
  iframe.onload = () => {
    iframe.style.opacity = '1';
  };
  
  if (initialOpen) {
    iframe.classList.add('open');
  }
  
  document.body.appendChild(iframe);

  // Setup message listener for communication between iframe and parent
  window.addEventListener('message', (event) => {
    // Verify origin to ensure messages only come from your chatbot domain
    if (event.origin !== 'https://your-vercel-deployment-url.vercel.app') return;
    
    // Handle resize events from the chatbot iframe
    if (event.data.type === 'resize') {
      const button = document.getElementById('abhinav-academy-chatbot-button');
      
      if (event.data.isOpen) {
        iframe.classList.add('open');
        if (button) button.style.display = 'none';
      } else {
        iframe.classList.remove('open');
        if (button) {
          button.style.display = 'flex';
          // Add animation to button when closing chat
          button.style.animation = 'bounce-in 0.5s ease forwards';
        }
      }
    }
  });

  // Toggle chat on button click
  if (!initialOpen) {
    const chatButton = document.getElementById('abhinav-academy-chatbot-button');
    chatButton.addEventListener('click', () => {
      // Remove notification when clicked
      const notification = chatButton.querySelector('.abhinav-academy-chatbot-notification');
      if (notification) notification.remove();
      
      // Open chat
      iframe.classList.add('open');
      chatButton.style.display = 'none';
      
      // Send message to iframe
      setTimeout(() => {
        iframe.contentWindow.postMessage({ 
          type: 'initialState',
          isOpen: true
        }, '*');
      }, 300);
    });
  }

  // Send initial state to iframe if specified in config
  if (initialOpen) {
    setTimeout(() => {
      iframe.contentWindow.postMessage({ 
        type: 'initialState',
        isOpen: true
      }, '*');
    }, 1000); // Wait for iframe to load
  }
})(); 