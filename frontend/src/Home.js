import React from 'react';
import TestComponent from './TestComponent';
import CSVUploadComponent from './CSVUploadComponent';
import {Link} from "react-router-dom";
import "./Home.css"
import backgroundImage from './assets/homePageBackgroundImage.png'

function Home() {
    return (
        <div  className='home-container' style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '100vh',

            }}>
            <header className="header">
                <h1>ProfitMaps</h1>
            </header>
            <div>
                <TestComponent />
                <CSVUploadComponent />
                <Link to="/createAccountPage" className="button">Create Account</Link>
            </div>
        </div>
    );
}

export default Home;
