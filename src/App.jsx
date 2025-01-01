import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import the Navbar component
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ConversationsList from './components/Conversation/ConversationsList';
import MessageBox from './components/Message/MessageBox';

function App() {
    return (
        <Router>
            {/* Always render the Navbar */}
            <Navbar />

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register title="Signup" />} />
                <Route path="/conversations" element={<ConversationsList />} />
                <Route path="/conversations/:conversationId" element={<MessageBox />} />
                <Route path="/create/user" element={<Register title="Create User" />} />
            </Routes>
        </Router>
    );
}

export default App;
