import React, {useEffect} from "react";
import './styles/Profile.css';
import {Link} from "react-router-dom";

const Profile = () => {
    const [username, setUsername] = React.useState("");

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    return (
        <div className="profile-container">
            <h1>{username || "User"}'s ProfitMap Profile</h1>
            <p>Upload you data here and generate a map to maximize profits.</p>

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