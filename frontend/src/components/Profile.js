import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import './styles/Home.css';

function Profile() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const fetchFields = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/fields/user-fields`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFields(response.data.fields);
            } catch (err) {
                console.error('Error fetching fields:', err);
            }
        };
        fetchFields();
    }, [navigate, token]);

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

            <div style={{ marginTop: '40px' }}>
                <h3>Your Fields</h3>
                {fields.length === 0 ? (
                    <p>You have not uploaded any fields yet.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {fields.map(field => (
                            <li key={field.id} style={{ marginBottom: '10px' }}>
                                <Link to={`/map/${field.id}`}>
                                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                        {field.name}
                                    </button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Profile;