import React from "react";
import './styles/Profile.css';
import {Link} from "react-router-dom";

const Profile = () => {
    return (
        <div className="profile-container">
            <h1>Welcome to Your Profile</h1>
            <p>Here you can manage and view your fields.</p>

            <div className="home-buttons">
                <Link to="/UploadPage">
                    <button className="profile-button">Upload Yield Data</button>
                </Link>
                <Link to="/MapView">
                    <button>View Profit Map</button>
                </Link>
            </div>

            <div className="data-container">
                <div className="data-box">Container 1</div>
                <div className="data-box">Container 2</div>
            </div>

        </div>
    );
}

export default Profile;