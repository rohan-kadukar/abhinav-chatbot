# Abhinav Academy Chatbot

A conversational AI interface for Abhinav Academy that can be embedded on any website.

## Features

- Interactive chatbot with conversational UI
- Light/Dark mode toggle
- Feedback system for responses
- Relevant question suggestions
- Responsive design for all devices
- Embeddable as a widget on other websites

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deploying on Vercel/Netlify

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Connect your repository to Vercel or Netlify
3. Deploy using their automated pipeline

## Embedding the Chatbot

To embed the chatbot on another website (like student-abhinav.vercel.app), add the following script tag to your HTML:

```html
<!-- Add this script at the end of your body tag -->
<script src="https://your-deployment-url.vercel.app/api/widget"></script>
```

Replace `your-deployment-url.vercel.app` with your actual deployed URL.

### Customization

To customize the appearance of the widget, you can add a configuration before loading the script:

```html
<script>
  window.ABHINAV_CHATBOT_CONFIG = {
    position: 'right', // 'right' or 'left'
    initialOpen: false, // Whether the chat should be open by default
    // Add more configuration options as needed
  };
</script>
<script src="https://your-deployment-url.vercel.app/api/widget"></script>
```

## Data Management

The chatbot uses various data sources:

- `lib/data.json` - Main knowledge base
- `lib/feedback.json` - User feedback on responses
- `lib/questions.json` - Unanswered user questions

## Tech Stack

- Next.js
- React
- Framer Motion
- TailwindCSS
- Fuse.js for search
- Compromise.js for NLP 