import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';

function Home() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (token) {
        navigate('/profile');
    }

    return (
        <div className="home-page">
            <h1>Welcome to Profit Map</h1>
            <p>Analyze and visualize your agricultural data to improve decision-making.</p>
            <p>Please register or log in using the navigation above to start exploring and managing your fields.</p>
            <div style={{ marginTop: '40px' }}>
                <h3>Example Map Visualization</h3>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <img
                        src="/example_map.png"
                        alt="Example map"
                        style={{ maxWidth: '400px', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <img
                        src="/satellite_example_map.png"
                        alt="Satellite example map"
                        style={{ maxWidth: '400px', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Home;