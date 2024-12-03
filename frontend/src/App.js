import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import CreateAccountPage from './CreateAccountPage';
import ProfilePage from './ProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirect from root path "/" to "/home" */}
                <Route path="/" element={<Navigate replace to="/Home" />} />
                {/* Route to Home Component */}
                <Route path="/Home" element={<Home />} />
                {/* Route to Create Account Component */}
                <Route path="/CreateAccountPage" element={<CreateAccountPage />} />
                {/* Route to Create Account Component */}
                <Route path="/ProfilePage" element={<ProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;
