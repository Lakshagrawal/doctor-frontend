const API_URL = 'http://localhost:5000/api/messages';

export const getMessages = async (conversationId) => {
    const response = await fetch(`${API_URL}/${conversationId}`);
    return response.json();
};

export const sendMessage = async (messageData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
    });
    return response.json();
};
