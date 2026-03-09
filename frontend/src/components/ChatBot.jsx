import React, { useState } from 'react';

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() === '')
            return;

        const newMessage = { text: input, sender: 'user' };
        setMessages([...messages, newMessage]);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            const botMessage = { text: 'This is a bot response.', sender: 'bot'}
            setMessages(prevMessages => [...prevMessages, votMessage]);
            

        }, 500);
        
    };

    return(
        <div>
            <div>
            {messages.map((msg, index) => (
                <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left'}}>
                    <span>{msg.text}</span>
                </div>

            ))}
        </div>
        <input 
           value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder='Type a message...'
        />
        <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default ChatBot;