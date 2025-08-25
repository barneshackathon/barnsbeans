// ===== BARNS CHATBOT CONFIGURATION =====
// This file contains configuration settings for the chatbot functionality
// including webhook URLs and chat behavior settings
const CHAT_CONFIG = {
  // Production N8N Webhook URL for AI chat processing
// This webhook receives user messages and returns AI-generated responses
N8N_WEBHOOK_URL: 'https://sultannn.app.n8n.cloud/webhook/7a43c1a8-7279-4ff5-b0e0-fb58cb2fd0cd',
  
  // Additional chat configuration settings
  CHAT_SETTINGS: {
    maxRetries: 3,           // Maximum number of retry attempts for failed requests
    timeout: 30000,          // Request timeout in milliseconds (30 seconds)
    showTypingIndicator: true // Whether to show typing indicators during AI processing
  }
};

// تصدير التكوين
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHAT_CONFIG;
}
