import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import Sidebar from './components/Sidebar';

function App() {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [users] = useState([
    { name: 'Alice' },
    { name: 'Bob' },
    { name: 'Charlie' },
  ]);

  const handleSend = (text) => {
    const newMsg = { text, sender: 'user' };
    setMessages([...messages, newMsg]);

    // Simulate a simple bot response for now
    setTimeout(() => {
      setMessages(prev => [...prev, { text: `Echo: ${text}`, sender: 'bot' }]);
    }, 1000);
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1>Multi-Chat App</h1>
      </header>
      <div style={styles.mainContent}>
        <Sidebar users={users} />
        <ChatBox messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
};

export default App;