import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CreateAccountPage from './CreateAccountPage';
import './Home.css';
import TestComponent from './TestComponent';
import CSVUploadComponent from './CSVUploadComponent';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/createaccountpage" element={<CreateAccountPage />} />
            </Routes>
            <div>
                <TestComponent />
            </div>
            <div>
                <CSVUploadComponent />
            </div>
        </Router>
    );
}

export default App;