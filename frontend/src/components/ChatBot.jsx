import React, { useState, useEffect} from 'react';
import Message from './Message';

const ChatBot = ({ messages, onSend }) => {
    const[input, setInput] = useState('');

    const handleSend = () => {
        if(!input.trim()) return;
        onSend(input);
        setInput('');

    };
    return(
        <div style={StyleSheet.container}>
            <div style={styles.chatMessages}>
                {messages.map((msg, index) =>(
                    <Message key={index} message={msg} />
                ))}
            </div>

            <div style={styles.inputBox}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSend();
                        }
                    }}
                />
            </div>
        </div>
    )
}