(function() {
  // Get configuration if available
  const config = window.ABHINAV_CHATBOT_CONFIG || {};
  const position = config.position || 'right';
  const initialOpen = config.initialOpen || false;
  
  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'abhinav-academy-chatbot-widget';
  document.body.appendChild(widgetContainer);

  // Load the widget iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'https://your-vercel-deployment-url.vercel.app/widget';
  iframe.style.border = 'none';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style[position] = '20px'; // Use the position from config
  iframe.style.width = initialOpen ? '370px' : '70px';
  iframe.style.height = initialOpen ? '550px' : '70px';
  iframe.style.boxShadow = '0 5px 40px rgba(0, 0, 0, 0.16)';
  iframe.style.borderRadius = '16px';
  iframe.style.zIndex = '999999';
  iframe.style.transition = 'all 0.3s ease';
  
  widgetContainer.appendChild(iframe);

  // Setup message listener for communication between iframe and parent
  window.addEventListener('message', (event) => {
    // Verify origin to ensure messages only come from your chatbot domain
    if (event.origin !== 'https://your-vercel-deployment-url.vercel.app') return;
    
    // Handle resize events from the chatbot iframe
    if (event.data.type === 'resize') {
      if (event.data.isOpen) {
        iframe.style.width = '370px';
        iframe.style.height = '550px';
      } else {
        iframe.style.width = '70px'; 
        iframe.style.height = '70px';
      }
    }
  });

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