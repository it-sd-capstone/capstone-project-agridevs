import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const token = localStorage.getItem('token');

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to={"/"}>
                    <h1>Profit Map</h1>
                </Link>
            </div>
            <ul className="navbar-links">
                {token ? (
                    <>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/upload">Upload Data</Link>
                        </li>
                        <li>
                            <Link to="/map">View Map</Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="logout-button">Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;