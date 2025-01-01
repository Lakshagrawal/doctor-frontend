import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleInvalidToken } from "../utils/auth.js";
import SearchResult from './Search/SearchResults.jsx';
function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            if (searchQuery.trim()) {
                try {
                    const response = await fetch(`${apiUrl}/users/find`, {
                        method: 'POST',
                        headers: {
                            'authorization': `${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ number: searchQuery })
                    });
                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }
                    const result = await response.json();
                    setUsers(result.data);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    setUsers([]);
                }
            } else {
                setUsers([]); // Clear results when search is empty
            }
        };
        fetchUsers();
    }, [searchQuery, token, apiUrl]);

    const handleLogout = () => {
        handleInvalidToken();
        navigate('/login');
    };

    return (
        <div>
            <nav className="bg-gray-800 p-4 flex justify-between items-center">
                <div className="flex space-x-6">
                    <Link to="/conversations" className="text-white hover:text-gray-300">Home</Link>
                    {token ? (
                        <>
                            <Link to="/create/user" className="text-white hover:text-gray-300">Create User</Link>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by mobile number"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="p-2 rounded border border-gray-300 w-64"
                                />
                                {/* Dropdown for search results */}
                                {searchQuery && users.length > 0 && <SearchResult users={users} />}
                            </div>
                            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
                            <Link to="/signup" className="text-white hover:text-gray-300">Signup</Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
