import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { handleInvalidToken } from '../../utils/auth.js';
const apiUrl = import.meta.env.VITE_API_URL;

function MessageBox() {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null); // Track the message being edited
    const userId = localStorage.getItem('userId');

    const intervalRef = useRef(null);

    useEffect(() => {
        if (conversationId) {
            fetchMessages(1);
            intervalRef.current = setInterval(() => {
                fetchMessages(1);
            }, 2000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [conversationId]);

    const fetchMessages = async (pages) => {
        if (isLoading) return;
        // setIsLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found!');
            handleInvalidToken();
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

                    // Combine new messages with previous ones and sort them
                    const updatedMessages = [...newMessages, ...prev].sort(
                        (a, b) => new Date(a.created_at) - new Date(b.created_at)
                    );

                    return updatedMessages;
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

    const requestPresignedUrl = async (file) => {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (!token) {
            console.error('No token found!');
            handleInvalidToken();
            return;
        }
        console.log(file);
        try {
            const response = await fetch(`${apiUrl}/messages/generate-presigned-url-put`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token,
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                }),
            });

            if (!response.ok) {
                console.log('Failed to get pre-signed URL');
                return null;
            }

            const { uploadUrl, remoteFilePath } = await response.json();  // The pre-signed URL
            return uploadUrl;
        } catch (err) {
            console.log('Failed to generate pre-signed URL');
            console.error('Error getting pre-signed URL:', err);
            return null;
        }
    };

    const uploadFileToS3 = async (file, uploadUrl) => {
        try {
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,  // Ensure the correct file type is sent
                },
                body: file,  // Send the file itself
            });

            if (!uploadResponse.ok) {
                console.log('Failed to upload file to S3');
                console.error("Failed to upload file to S3");
                return null;
                // throw new Error('Failed to upload file to S3');
            }

            const fileUrl = uploadUrl.split('?')[0];  // Extract the public file URL from the pre-signed URL
            return fileUrl;  // Return the file URL to be sent in the message
        } catch (err) {
            console.error('Error uploading file to S3:', err);
            console.log('Failed to upload file');
            return null;
            // throw new Error('Failed to upload file');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found!');
            handleInvalidToken();
            return;
        }

        // console.log("form is submitting");
        let publicFileUrl = null;
        if (selectedFile) {
            console.log("this is the selected file data", selectedFile);
            try {
                const presignedAwsUrl = await requestPresignedUrl(selectedFile);  // Get the pre-signed URL
                console.log("this is Fthe pre-signed uploadURL****", presignedAwsUrl);
                publicFileUrl = await uploadFileToS3(selectedFile, presignedAwsUrl);  // Upload the file and get the URL
                console.log("**this is the public fileUrl****", publicFileUrl);
            } catch (error) {
                const errorData = await response.json();
                console.error("API Error:", errorData.message || 'Something went wrong');
                return;
            }
        }


        try {
            const method = editingMessage ? 'PUT' : 'POST'; // Use PUT if updating a message
            const endpoint = editingMessage
                ? `${apiUrl}/messages/${editingMessage.message_id}`
                : `${apiUrl}/messages`;

            let params = {
                'conversationId': conversationId,
                'senderId': userId,
                'messageType': (selectedFile ? 'url' : 'text'),
                'messageText': newMessage,
                'object_url': publicFileUrl,
            };
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                },
                body: JSON.stringify(params),
            });

            if (response.ok) {
                const data = await response.json();
                const newMsg = { ...data.data, sender_id: userId, context: newMessage };

                if (editingMessage) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.message_id === editingMessage.message_id ? newMsg : msg
                        )
                    );
                } else {
                    setMessages((prev) => [...prev, newMsg]);
                }
                setNewMessage('');
                setSelectedFile(null); // Clear the selected file
                setEditingMessage(null); // Reset editing state
            } else {
                console.error('Failed to send or update message', response.status);
            }
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateGetPresignedUrl = async (e, object_url) => {
        e.stopPropagation();
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found!');
            handleInvalidToken();
            return;
        }

        const endpoint = `${apiUrl}/messages/generate-presigned-url-get`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token,
                },
                body: JSON.stringify({
                    object_url: object_url
                }),
            })

            if (!response.ok) {
                console.log('Failed to generate presigned URL');
                return null;
                // throw new Error('Failed to generate presigned URL');
            }
            const data = await response.json();
            console.log("this si the data object", data);
            const { objectUrl } = data;
            console.log("this si the object url", objectUrl);

            // Open the URL in a new tab
            window.open(objectUrl, '_blank'); // '_blank' opens the URL in a new tab

            // return url;

        } catch (error) {
            console.error('Error generating presigned URL:', error);
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB max size
                alert("File is too large!");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleEditMessage = (msg) => {
        setEditingMessage(msg);
        setNewMessage(msg.context); // Pre-fill the input with the message's context
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
                    {isLoading ? 'Loading...' : 'Load Older Messages'}
                </button>
            )}

            <div className="w-full max-w-xl mt-4 overflow-y-auto h-96 bg-gray-100 p-4 rounded-md shadow-lg flex flex-col gap-2">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div
                            key={msg.message_id}
                            className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`p-3 rounded-md shadow-sm ${msg.sender_id === userId
                                    ? 'bg-green-100 text-right'
                                    : 'bg-white text-left'
                                    }`}
                            >
                                <p className="text-sm text-gray-800">{msg.context}</p>
                                {msg.object_url && (
                                    <a href="#" onClick={(e) => generateGetPresignedUrl(e, msg.object_url)}>
                                        <p className="text-blue-500 text-sm">View File</p>
                                    </a>
                                )}
                                {msg.sender_id === userId && (
                                    <button
                                        className="text-sm text-blue-500 mt-2"
                                        onClick={() => handleEditMessage(msg)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500 text-center">No messages yet</div>
                )}
            </div>

            <form
                onSubmit={(e) => handleSendMessage(e)}
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

                <input
                    type="file"
                    onChange={handleFileChange}
                    className="ml-2"
                />

                <button
                    type="submit"
                    className="ml-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                    disabled={isLoading}
                >
                    {editingMessage ? 'Update' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default MessageBox;
