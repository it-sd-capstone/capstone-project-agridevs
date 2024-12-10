import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Home.css';

function Profile() {
    return (
        <div className="home-page">
            <h1>Your Profile</h1>
            <p>Manage your fields, upload yield data, and view profit maps.</p>
            <div className="home-buttons">
                <Link to="/upload">
                    <button>Upload Yield Data</button>
                </Link>
                <Link to="/map">
                    <button>View Entire Farm Map</button>
                </Link>
            </div>
        </div>
    );
}

export default Profile;