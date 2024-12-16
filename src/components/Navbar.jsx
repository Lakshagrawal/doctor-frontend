import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navLinks}>
                {!token ? (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/signup" style={styles.link}>Signup</Link>
                    </>
                ) : (
                    <>
                        <Link to="/conversation" style={styles.link}>Conversation</Link>
                        <button onClick={handleLogout} style={styles.button}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        background: '#333',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
    },
    navLinks: {
        display: 'flex',
        gap: '1rem',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '1.2rem',
    },
    button: {
        background: '#f44336',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
};

export default Navbar;
