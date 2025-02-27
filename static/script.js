document.addEventListener('DOMContentLoaded', function() {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');
  const heartIcon = document.querySelector('.heart-icon');
  const sendIcon = document.querySelector('.send-icon');

  // Toggle send button icon based on input
  messageInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
      heartIcon.classList.add('hidden');
      sendIcon.classList.remove('hidden');
      sendButton.disabled = false;
    } else {
      heartIcon.classList.remove('hidden');
      sendIcon.classList.add('hidden');
      sendButton.disabled = true;
    }
  });

  // Send message on button click
  sendButton.addEventListener('click', sendMessage);

  // Send message on Enter key
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  async function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      addMessageToChat(message, 'sent', timeString);
      messageInput.value = '';
      heartIcon.classList.remove('hidden');
      sendIcon.classList.add('hidden');
      sendButton.disabled = true;
      showTypingIndicator();

      try {
        // 🔥 Send message to Flask backend
        const response = await fetch("http://127.0.0.1:5000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });
        const botResponse = await response.json();
        removeTypingIndicator();
        addMessageToChat(botResponse.response, 'received', timeString);
      } catch (error) {
        console.error("Error communicating with chatbot:", error);
        removeTypingIndicator();
        addMessageToChat("Oops! Server not responding. Try again later.", 'received', timeString);
      }
    }
  }

  function addMessageToChat(content, sender, time) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    let avatarHtml = sender === 'received' ? `
      <div class="message-avatar">
        <img src="/static/images/image.jpg" alt="Avatar">
      </div>
    ` : '';

    messageElement.innerHTML = `
      ${avatarHtml}
      <div class="message-content">
        <div class="message-bubble">${content}</div>
        <div class="message-time">${time}</div>
      </div>
      ${sender === 'sent' ? avatarHtml : ''}
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('typing-indicator');
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = `<span></span><span></span><span></span>`;
    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
      typingElement.remove();
    }
  }
});
