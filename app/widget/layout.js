import '../globals.css';
import '../chatbot.css';

export const metadata = {
  title: 'Abhinav Academy Chatbot Widget',
  description: 'Embeddable chatbot widget for Abhinav Academy',
};

export default function WidgetLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-transparent">
        {children}
      </body>
    </html>
  );
} 