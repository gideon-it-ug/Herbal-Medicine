import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatWithAssistant } from '../services/api';
import '../App.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Osiibire! I am your Herbal Medicine Assistant for Bukedi Sub-Region. Ask me about any medicinal plant or ailment — for example: "what treats malaria?" or "tell me about Kigajji". The more plants are added to the database, the smarter I become!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);

  // Check if the user is a supervisor (admin) on mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // The role is stored in the user profile, not the JWT itself.
        // We check is_staff as a fallback for admin/superuser status.
        setIsSupervisor(payload.is_staff || payload.is_superuser || false);
      } catch {
        setIsSupervisor(false);
      }
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatWithAssistant(input, isSupervisor);
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I could not connect to the server.' }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <nav className="navbar">
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/plants" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>All Plants</Link>
          {isSupervisor && (
            <span style={{ color: '#FF8F00', marginLeft: '20px', fontSize: '13px' }}>👑 Supervisor Mode</span>
          )}
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">🤖 Herbal Medicine Chatbot</h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
          {isSupervisor
            ? '👑 Supervisor mode active — you receive elevated responses with admin capabilities.'
            : '💡 The chatbot uses a trained AI model (TF-IDF + Logistic Regression, 72.83% accuracy) that classifies your messages into intents and returns diverse, context-aware responses.'}
        </p>
        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="chat-message bot">Thinking...</div>}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about a plant or ailment..."
            />
            <button className="btn" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
