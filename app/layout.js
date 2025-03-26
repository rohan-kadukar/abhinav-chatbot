import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Abhinav Academy Chatbot',
  description: 'A conversational AI interface for Abhinav Academy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen transition-colors duration-300">
        {children}
      </body>
    </html>
  );
} 