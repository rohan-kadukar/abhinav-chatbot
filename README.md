# Abhinav Academy Chatbot Widget

A versatile chatbot interface for Abhinav Academy that can be embedded on any website as a floating widget.

## Features

- Floating chat widget with a clean, modern design
- Dark/light mode support
- Responsive design for all devices
- Customizable appearance and behavior
- Easy integration into any website via a simple script

## Demo

Visit [https://your-deployment-url.com](https://your-deployment-url.com) to see the chatbot in action.

## Deployment

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/abhinav-academy-chatbot.git
   cd abhinav-academy-chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start
   # or
   yarn start
   ```

### Deployment Options

#### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/abhinav-academy-chatbot)

#### Other Hosting Providers

You can also deploy to Netlify, AWS, DigitalOcean, or any other service that supports Next.js applications.

## Integration Guide

### Basic Integration

To add the chatbot to your website, add the following code to your HTML:

```html
<script>
  window.abhinavAcademyChatbotSettings = {
    // Optional custom settings
    // title: 'Custom Title',
    // position: 'left', // 'right' or 'left'
    // theme: 'dark', // 'light' or 'dark'
  };
</script>
<script src="https://your-deployment-url.com/chatbot-widget.js" async></script>
```

### Customization Options

You can customize the chatbot by adding options to `window.abhinavAcademyChatbotSettings`:

```js
window.abhinavAcademyChatbotSettings = {
  title: 'Abhinav Academy Support',
  position: 'left', // 'right' or 'left'
  primaryColor: '#4f46e5', // Indigo
  secondaryColor: '#7e22ce', // Purple
  theme: 'dark', // 'light' or 'dark'
  allowDarkMode: true, // Whether to show the dark mode toggle
  welcomeMessage: 'Hello! How can I help you today?'
};
```

## Project Structure

- `/app` - Next.js app and API routes
- `/components` - React components for the chatbot
- `/lib` - Utility functions and data storage
- `/public` - Static files including the embedding script

## Customizing the Chatbot

### Modifying the Chat Responses

To modify the predefined responses and knowledge base, edit the files in the `lib` folder:

- `data.json` - Contains the main knowledge base
- `questions.json` - Contains suggested questions
- `chatUtils.js` - Contains the response logic

### Customizing the Design

The design uses Tailwind CSS and can be customized by:

1. Editing the component files in the `components` folder
2. Modifying the Tailwind config in `tailwind.config.js`
3. Adding custom CSS in `app/globals.css`

## License

MIT

## Contact

For any questions or issues, please open an issue on GitHub or contact us at your-email@example.com. 