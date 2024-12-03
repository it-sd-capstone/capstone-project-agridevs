import React, { useEffect, useState } from 'react';
import CSVUploadComponent from './CSVUploadComponent';

function ProfilePage() {
    const [userData, setUserData] = useState(null);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('https://localhost3000/register', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',

                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    if (!userData) return <div>Loading...</div>;

    return (
        <div>
            <h1>Welcome, {userData.firstname}!</h1>
            <p>Username: {userData.username}</p>
            <p>Farm Name: {userData.nameoffarm}</p>
            <button>Edit Profile</button>
            <CSVUploadComponent />
        </div>
    );
}

export default ProfilePage;