import React from 'react';
import './styles/Home.css';


function Home() {
    return (
        <div className="home-page">
            <h1>Welcome to Profit Map</h1>
            <p>ProfitMaps aims to help farmers visualize profitability by using yield data mapped onto satellite imagery.
                Users can upload CSV files, which then get processed to generate a map with an overlaid color gradient.
                Analyze and visualize your field data for better agricultural decisions.</p>
        </div>
    );
}

export default Home;