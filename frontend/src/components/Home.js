import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Home.css';

function Home() {
    return (
        <div className="home-page">
            <h1>Welcome to Profit Map</h1>
            <p>Analyze and visualize your field data for better agricultural decisions.</p>
        </div>
    );
}

export default Home;