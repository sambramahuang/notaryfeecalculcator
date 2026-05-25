/* =============================================
   CHAT WIDGET — Notary Fee Assistant
   ============================================= */

const chatTrigger  = document.getElementById('chatTrigger');
const chatPanel    = document.getElementById('chatPanel');
const chatClose    = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');

let conversationHistory = [];
let isLoading = false;

function openChat() {
  chatPanel.classList.add('open');
  chatPanel.setAttribute('aria-hidden', 'false');
  chatInput.focus();
}

function closeChat() {
  chatPanel.classList.remove('open');
  chatPanel.setAttribute('aria-hidden', 'true');
}

function appendBubble(role, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

function setLoading(state) {
  isLoading = state;
  chatSend.disabled = state;
  chatInput.disabled = state;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isLoading) return;

  chatInput.value = '';
  appendBubble('user', text);

  conversationHistory.push({ role: 'user', content: text });

  setLoading(true);
  const loadingBubble = appendBubble('loading', 'Calculating…');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await res.json();

    loadingBubble.remove();

    if (!res.ok || data.error) {
      appendBubble('error', 'Sorry, something went wrong. Please try again.');
      conversationHistory.pop();
    } else {
      appendBubble('assistant', data.reply);
      conversationHistory.push({ role: 'assistant', content: data.reply });
    }
  } catch {
    loadingBubble.remove();
    appendBubble('error', 'Unable to reach the server. Check your connection.');
    conversationHistory.pop();
  } finally {
    setLoading(false);
    chatInput.focus();
  }
}

chatTrigger.addEventListener('click', openChat);
chatClose.addEventListener('click', closeChat);
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
