import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchResults({ users }) {
  const navigate = useNavigate();
  const [loadingUserId, setLoadingUserId] = useState(null); // Track loading state for each button
  const [error, setError] = useState(null); // Track errors

  const handleStartConversation = async (user) => {
    setLoadingUserId(user?.user_id); // Indicate which button is loading
    setError(null); // Clear previous errors

    const token = localStorage.getItem('token');
    const user1Id = localStorage.getItem('userId');
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(`${apiUrl}/conversations/start`, {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1Id: user1Id,
          user2Id: user.user_id,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await res.json();
      navigate(`/conversations/${data?.data?.conversation_id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingUserId(null); // Reset loading state
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}

      {users?.length > 0 ? (
        <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
          {users?.map((user) => (
            <div
              key={user?.user_id}
              className="px-4 py-2 border-b hover:bg-gray-100"
            >
              <button
                type="button"
                onClick={() => handleStartConversation(user)}
                disabled={loadingUserId === user?.user_id}
                className={`text-blue-500 hover:underline ${
                  loadingUserId === user?.user_id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label={`Start conversation with ${user?.username}`}
              >
                {loadingUserId === user?.user_id ? 'Starting...' : user.username}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
}
