import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; // Make sure the import is correct
import CreateAccountPage from './CreateAccountPage'; // Correct the path and component name
import './Home.css';
import TestComponent from './TestComponent';
import CSVUploadComponent from './CSVUploadComponent';

function App() {

    useEffect(() => {
        // Redirect to /Home when app loads
        window.location.href = '/home';
    }, []);

    return (
        <Router>
            <Routes>
                {/* Route to Home Component */}
                <Route path="/Home" element={<Home />} />
                {/* Route to Create Account Component */}
                <Route path="/CreateAccountPage" element={<CreateAccountPage />} />
            </Routes>
        </Router>
    );
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to Profit Map Web App</h1>
            </header>
            <div>
                <TestComponent />
            </div>
            <div>
                <CSVUploadComponent />
            </div>
        </div>
    );
}

export default App;
