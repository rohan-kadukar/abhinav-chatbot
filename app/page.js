'use client';
import FloatingChatWidget from "../components/FloatingChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="text-center px-4 py-8">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">Abhinav Academy Chatbot</h1>
        <p className="text-lg text-gray-700 mb-8">
          A conversational AI interface for Abhinav Academy
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/embed" 
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            View Full Version
          </a>
          <a 
            href="https://github.com/yourusername/abhinav-academy-chatbot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-5 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition-all"
          >
            View on GitHub
          </a>
        </div>
      </div>
      
      <div className="mt-12 max-w-2xl w-full px-4">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">How to Integrate in Your Website</h2>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="mb-4 text-gray-700">
            Add the following script to your website to integrate the Abhinav Academy Chatbot:
          </p>
          <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm text-gray-800">
              {`<script>
  window.abhinavAcademyChatbotSettings = {
    // Optional custom settings
    // title: 'Custom Title',
    // position: 'left', // 'right' or 'left'
    // theme: 'dark', // 'light' or 'dark'
  };
</script>
<script src="https://your-deployment-url.com/chatbot-widget.js" async></script>`}
            </pre>
          </div>
        </div>
      </div>
      
      {/* Include the floating chatbot here */}
      <FloatingChatWidget />
    </main>
  );
} 