// تعريف الدالة في النطاق العام
window.initAIForm = function({ formSelector, inputSelector, chatBodySelector }) {
  console.log('initAIForm called with:', { formSelector, inputSelector, chatBodySelector });
  
  // فحص وجود CHAT_CONFIG
  if (typeof CHAT_CONFIG === 'undefined') {
    console.error('AI Form: CHAT_CONFIG not found. Make sure config.js is loaded first.');
    return;
  }
  
  const form = document.querySelector(formSelector);
  const input = document.querySelector(inputSelector);
  const chatBody = document.querySelector(chatBodySelector);
  
  console.log('Found elements:', { 
    form: !!form, 
    input: !!input, 
    chatBody: !!chatBody,
    formSelector,
    inputSelector,
    chatBodySelector
  });
  
  const WEBHOOK_URL = CHAT_CONFIG.N8N_WEBHOOK_URL;
  
  // تسجيل للتشخيص
  console.log('AI Form initialized with webhook URL:', WEBHOOK_URL);
  
  // فحص صحة رابط الويب هوك
  if (!WEBHOOK_URL || WEBHOOK_URL === 'undefined') {
    console.error('AI Form: Invalid webhook URL:', WEBHOOK_URL);
    return;
  }
  
  if (!form || !input || !chatBody) {
    console.error('AI Form: Required elements not found');
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // مهم: يمنع الرفرش
    const question = (input.value || "").trim();
    if (!question) return;

    const btn = form.querySelector("button");
    if (btn) btn.disabled = true;
    
    // Add user message to chat
    chatBody.insertAdjacentHTML('beforeend', '<div class="msg me"></div>');
    chatBody.lastElementChild.textContent = question;
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = '';
    
    // Add loading message
    chatBody.insertAdjacentHTML('beforeend', '<div class="msg bot loading">⏳ Barnie is thinking...</div>');
    chatBody.scrollTop = chatBody.scrollHeight;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 30000);

    try {
      console.log('Sending request to webhook:', WEBHOOK_URL);
      console.log('Request payload:', { question });
      
      const requestPayload = { 
        question: question,
        user: 'Barns User',
        timestamp: new Date().toISOString(),
        session: Date.now()
      };
      
      console.log('Full request payload:', requestPayload);
      
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });
      
      const text = await res.text();
      console.log('Webhook response status:', res.status);
      console.log('Webhook response headers:', Object.fromEntries(res.headers.entries()));
      console.log('Webhook response text:', text);
      
      // Remove loading message
      const loadingMsg = chatBody.querySelector('.msg.loading');
      if (loadingMsg) {
        loadingMsg.remove();
      }
      
      // فحص حالة الاستجابة
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}, response: ${text}`);
      }
      
      try {
        const data = JSON.parse(text);
        console.log('Parsed response data:', data);
        
        const reply = (data && (data.reply ?? data.message ?? data.response)) || 
                     (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) || 
                     "Thanks for your message! I'll get back to you soon.";
        
        // Add bot response
        chatBody.insertAdjacentHTML('beforeend', '<div class="msg bot"></div>');
        chatBody.lastElementChild.textContent = reply;
      } catch (parseError) {
        console.log('Failed to parse JSON, using raw text:', parseError);
        const reply = text || "Thanks for your message! I'll get back to you soon.";
        
        // Add bot response
        chatBody.insertAdjacentHTML('beforeend', '<div class="msg bot"></div>');
        chatBody.lastElementChild.textContent = reply;
      }
      
      // Scroll to show new messages
      chatBody.scrollTop = chatBody.scrollHeight;
      
    } catch (err) {
      console.error('Error in webhook request:', err);
      
      // Remove loading message
      const loadingMsg = chatBody.querySelector('.msg.loading');
      if (loadingMsg) {
        loadingMsg.remove();
      }
      
      let errorMessage = "Sorry, something went wrong. Please try again.";
      
      if (err.name === 'AbortError') {
        errorMessage = "Sorry, the request timed out. Please try again.";
      } else if (err.message.includes('HTTP error')) {
        errorMessage = `Server error: ${err.message}`;
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Unable to connect to the server. Please check your internet connection.";
      }
      
      console.log('Displaying error message:', errorMessage);
      chatBody.insertAdjacentHTML('beforeend', '<div class="msg bot error"></div>');
      chatBody.lastElementChild.textContent = errorMessage;
      
      // Scroll to show error message
      chatBody.scrollTop = chatBody.scrollHeight;
    } finally {
      clearTimeout(t);
      if (btn) btn.disabled = false;
    }
  });
}
