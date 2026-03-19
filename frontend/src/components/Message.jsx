import React from 'react';

const Message = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? '#DCF8C6' : '#EEE',
        padding: '8px 12px',
        borderRadius: 12,
        margin: '4px 0',
        maxWidth: '70%',
      }}
    >
      {message.text}
    </div>
  );
};///toda

export default Message;