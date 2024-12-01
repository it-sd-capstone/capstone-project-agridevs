import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import CreateAccountPage from './CreateAccountPage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirect from root path "/" to "/home" */}
                <Route path="/" element={<Navigate replace to="/home" />} />
                {/* Route to Home Component */}
                <Route path="/home" element={<Home />} />
                {/* Route to Create Account Component */}
                <Route path="/createaccountpage" element={<CreateAccountPage />} />
            </Routes>
        </Router>
    );
}

export default App;
