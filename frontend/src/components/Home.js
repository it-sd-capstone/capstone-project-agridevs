import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Home.css';

function Home() {
    return (
        <div className="home-page">
            <h1>Welcome to Profit Map</h1>
            <p>Analyze and visualize your field data for better agricultural decisions.</p>
            <div className="home-buttons">
                <Link to="/upload">
                    <button>Upload Yield Data</button>
                </Link>
                <Link to="/map">
                    <button>View Profit Map</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;