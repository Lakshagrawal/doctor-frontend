import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

function MessageBox() {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        setMessages([]);
        setPage(1);
        if (conversationId) {
            fetchMessages(1);
        }
    }, [conversationId]);

    const fetchMessages = async (pages) => {
        if (isLoading) return;
        setIsLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found!');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/messages/${conversationId}/${pages}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("lakshya is good", data.data.messages);
                const fetchedMessages = data?.data?.messages.reverse(); // Reverse for chronological order
                const hasMore = data?.data?.hasMore;
                setHasMore(hasMore);
                console.log('Has more messages:', hasMore);
                console.log(fetchedMessages);

                setMessages((prev) => {
                    const newMessages = fetchedMessages.filter(
                        (fetchedMessage) => !prev.some((msg) => msg.message_id === fetchedMessage.message_id)
                    );
                    return [...newMessages, ...prev];
                });
                
            } else {
                console.error('No messages available', response.status);
            }
        } catch (error) {
            console.error('Error fetching messages', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found!');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                },
                body: JSON.stringify({
                    conversationId,
                    messageText: newMessage,
                    senderId: userId,
                    messageType: 'text',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [
                    ...prev,
                    { ...data.data, sender_id: userId, context: newMessage },
                ]);
                setNewMessage('');
            } else {
                console.error('Failed to send message', response.status);
            }
        } catch (error) {
            console.error('Error sending message', error);
        }
    };

    const fetchOldMessage = () => {
        setPage((prevPage) => prevPage + 1);
    };

    useEffect(() => {
        if (conversationId && page > 1) {
            fetchMessages(page);
        }
    }, [page]);

    return (
        <div className="flex flex-col items-center p-4">
            {hasMore && messages.length > 0 && (
                <button
                    disabled={isLoading}
                    className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-600"
                    onClick={fetchOldMessage}
                >
                    Load Older Messages
                </button>
            )}

<div className="w-full max-w-xl mt-4 overflow-y-auto h-96 bg-gray-100 p-4 rounded-md shadow-lg flex flex-col gap-2">
    {messages.length > 0 ? (
        messages.map((msg) => (
            <div
                key={msg.message_id}
                className={`flex ${
                    msg.sender_id === userId ? 'justify-end' : 'justify-start'
                }`}
            >
                <div
                    className={`p-3 rounded-md shadow-sm ${
                        msg.sender_id === userId
                            ? 'bg-green-100 text-right'
                            : 'bg-white text-left'
                    }`}
                >
                    <p className="text-sm text-gray-800">{msg.context}</p>
                </div>
            </div>
        ))
    ) : (
        <div className="text-gray-500 text-center">No messages yet</div>
    )}
</div>


            <form
                onSubmit={handleSendMessage}
                className="w-full max-w-xl mt-4 flex items-center"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    required
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
                <button
                    type="submit"
                    className="ml-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default MessageBox;
