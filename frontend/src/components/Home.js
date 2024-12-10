import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Home.css';

function Home() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // If the user is logged in, redirect to profile page
    if (token) {
        navigate('/profile');
    }

    return (
        <div className="home-page">
            <h1>Welcome to Profit Map</h1>
            <p>Analyze and visualize your agricultural data to improve decision-making.</p>
            <p>Log in or register to start exploring and managing your fields.</p>
            <div className="home-buttons">
                <Link to="/login">
                    <button>Log In</button>
                </Link>
                <Link to="/register">
                    <button>Register</button>
                </Link>
            </div>
            <div style={{ marginTop: '40px' }}>
                <h3>Example Map Visualization</h3>
                <img src="/example_map.png" alt="Example map" style={{ maxWidth: '400px', border: '1px solid #ccc', borderRadius: '8px' }}/>
            </div>
        </div>
    );
}

export default Home;