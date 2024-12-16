import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [number, setNumber] = useState('');  // Changed username to number
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ number, password })  // Use number here instead of username
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                navigate('/conversations');
            } else {
                alert('Login failed!');
            }
        } catch (error) {
            alert('Login failed!');
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input
                    type="tel"                  // Use type="tel" for phone number input
                    placeholder="Mobile Number"  // Placeholder for the input field
                    value={number}              // Use the number variable
                    onChange={(e) => setNumber(e.target.value)}  // Update number on change
                    required
                    pattern="^\+?[1-9]\d{1,14}$"  // Regex pattern for international mobile numbers (optional)
                    maxLength="15"               // Optional: limits input length to 15 characters (common for phone numbers)
                    title="Enter a valid mobile number" // Provides a message for invalid input
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
