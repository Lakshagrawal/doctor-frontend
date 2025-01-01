const API_URL = 'http://localhost:5000/api/conversations';

export const getConversations = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            authorization: `${token}`,
        }
    });
    return response.json();
};
