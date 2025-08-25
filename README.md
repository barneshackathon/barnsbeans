# Barns Coffee Loyalty App

A modern coffee loyalty application with AI-powered chatbot functionality, tree growth system, and QR code scanning features.

## Features

- **User Authentication**: Simple login system with local storage
- **Tree Growth System**: Visual tree with leaves that grow based on user activity
- **QR Code Scanning**: Camera-based QR code scanning for rewards
- **AI Chatbot**: Powered by n8n webhook integration
- **Loyalty Rewards**: Coffee beans and special rewards system
- **Friends System**: Social features for coffee enthusiasts

## AI Chatbot Integration

### Webhook Configuration

The chatbot is integrated with n8n using the following production webhook:

```
https://sultannn.app.n8n.cloud/webhook/33d36dea-a8d9-439c-bbed-dc87c7e45315
```

### Request/Response Schema

**Frontend → n8n (Request):**
```json
{
  "question": "string"
}
```

**n8n → Frontend (Response):**
```json
{
  "reply": "string",
  "traceId": "string" // optional
}
```

### Testing with curl

You can test the webhook integration using curl:

```bash
curl -i -X POST "https://sultannn.app.n8n.cloud/webhook/33d36dea-a8d9-439c-bbed-dc87c7e45315" \
  -H "Content-Type: application/json" \
  -d '{"question":"اختبار"}'
```

### CORS Configuration

The n8n webhook should return the following headers to ensure proper CORS handling:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: POST, OPTIONS
Content-Type: application/json
```

**Note**: If you encounter CORS preflight issues, add an OPTIONS webhook handler on the same path in n8n that returns a 204 status with the same CORS headers.

### Quick Testing

For quick local testing, use the `test-chat.html` file which contains everything inline (HTML+CSS+JS) and works directly from the file system.

## Technical Implementation

### File Structure

```
barns-project/
├── assets/
│   └── js/
│       └── ai.js          # AI integration module
├── chatbot.html           # Chatbot interface
├── app.js                 # Main application logic
├── config.js              # Configuration settings
├── style.css              # Styling and layout
└── README.md              # This file
```

### AI Integration Module

The `assets/js/ai.js` module provides:

- **initAIForm()**: Main function to initialize chat forms
- **30-second timeout**: Using AbortController for request management
- **Error handling**: Graceful fallbacks for network issues
- **Loading states**: Visual feedback during AI processing
- **JSON parsing**: Fail-safe response handling

### Usage

```javascript
// Initialize AI chat form
initAIForm({
  formSelector: '#chat-form',
  inputSelector: '#user-input',
  outputSelector: '#result'
});
```

## Development

### Prerequisites

- Modern web browser with ES6+ support
- No build tools required - pure static HTML/CSS/JS
- GitHub Pages compatible

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. Navigate to the chat page to test AI integration

### Deployment

The app is designed to work as a static site and can be deployed to:
- GitHub Pages
- Netlify
- Any static hosting service

## Browser Support

- Chrome 67+
- Firefox 60+
- Safari 11.1+
- Edge 79+

## License

This project is developed for hackathon purposes.
