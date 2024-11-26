import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// Import any additional components
import TestComponent from './TestComponent';
import CSVUploadComponent from "./CSVUploadComponent";

function Home() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Profit Maps</h1>
                <TestComponent />
                <CSVUploadComponent />
            </header>
            <nav>
                <ul>
                    <li><Link to="/Home">Home Page</Link></li>
                    <li><Link to="/CreateAccountPage">Create Account</Link></li>
                </ul>
            </nav>
        </div>
    );
}

export default Home;
