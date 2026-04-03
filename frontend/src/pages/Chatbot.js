import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hello! I am the Herbal Medicine Assistant. Ask me about any ailment or plant — for example: "what treats malaria?" or "tell me about Kigajji".' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/nlp/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
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
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">🤖 Herbal Medicine Chatbot</h2>
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