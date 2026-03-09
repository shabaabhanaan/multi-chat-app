import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import Sidebar from './components/Sidebar';

function App() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([
    { name: 'Alice' },
    { name: 'Bob' },
  ]);

  const handleSend = (text) => {
    const newMsg = { text, sender: 'user' };
    setMessages([...messages, newMsg]);

    // simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: `Bot: You said "${text}"`, sender: 'bot' }]);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar users={users} />
      <ChatBox messages={messages} onSend={handleSend} />
    </div>
  );
}

export default App;