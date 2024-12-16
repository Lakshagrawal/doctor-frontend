import React, { useState, useEffect } from 'react';

function ConversationsList() {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/conversations', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        };
        fetchConversations();
    }, []);

    return (
        <div>
            <h2>Conversations</h2>
            {conversations.map((conv) => (
                <div key={conv.conversation_id}>
                    <p>{conv.last_message}</p>
                </div>
            ))}
        </div>
    );
}

export default ConversationsList;
