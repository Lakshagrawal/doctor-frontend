import React, { useState, useEffect } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;
import { handleInvalidToken } from '../../utils/auth.js';
import { Link, useNavigate } from 'react-router-dom';

function ConversationsList() {
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchConversations = async () => {

            // Check if token or userId is missing
            if (!token || !userId) {
                handleInvalidToken();
                navigate('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/conversations/${userId}`, {
                method: 'GET',
                headers: {
                    authorization: token,
                },
            });

            if (response.status === 401 || response.status === 403) {
                handleInvalidToken();
                navigate('/login');
                return;
            } else {
                if (response.ok) {
                    const data = await response.json();
                    const conversationsData = data?.data?.conversations || [];
                    setConversations(conversationsData);
                }
            }
        };
        fetchConversations();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Conversations</h2>
            {conversations.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {conversations.map((conv) => (
                        <div
                            key={conv?.conversation_id}
                            className="bg-white shadow rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">
                                User: {conv?.name}
                            </h3>
                            {/* <p className="text-gray-600 text-sm mt-1">
                                Conversation ID: {conv?.conversation_id}
                            </p> */}
                            <p className="text-gray-700 mt-2">
                            Last Message: {conv?.last_message}</p>
                            <Link
                                to={`/conversations/${conv?.conversation_id}`}
                                className="inline-block mt-4 text-indigo-600 font-medium hover:underline"
                            >
                                Go to Conversation →
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 text-sm mt-4">
                    No conversations available.
                </p>
            )}
        </div>
    );
}

export default ConversationsList;
