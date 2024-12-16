import React, { useState, useEffect } from 'react';

function MessageBox({ conversationId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            const response = await fetch(`http://localhost:5000/api/messages/${conversationId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        };
        fetchMessages();
    }, [conversationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ conversation_id: conversationId, context: newMessage })
        });
        if (response.ok) {
            setNewMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg) => (
                    <p key={msg.message_id}>{msg.context}</p>
                ))}
            </div>
            <form onSubmit={handleSendMessage}>
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Type a message..." 
                    required 
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default MessageBox;
