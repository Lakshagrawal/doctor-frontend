import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    
    // State to hold form data
    const [formData, setFormData] = useState({
        username: '',
        number: '',
        email: '',
        password: '',
        is_admin: false
    });

    // State to hold error messages
    const [error, setError] = useState('');

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Get the API URL from environment variables
            const apiUrl = import.meta.env.VITE_API_URL;

            // Send POST request to the backend to create a new user
            const response = await fetch(`${apiUrl}/users/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful registration, redirect to login
                navigate('/login');
            } else {
                // Handle registration error
                setError(data.message || 'An error occurred during registration');
            }
        } catch (error) {
            // Handle any network errors
            setError('Failed to connect to the server');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Register</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Phone Number</label>
                    <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.submitButton}>Register</button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        width: '400px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f7f7f7',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginTop: '5px',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        fontSize: '1rem',
        cursor: 'pointer',
        borderRadius: '4px',
    },
    error: {
        color: 'red',
        fontSize: '1rem',
        marginBottom: '15px',
    },
};

export default Register;
