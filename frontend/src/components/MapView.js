import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/MapView.css';

const MapView = ({ fieldId }) => {
    const [dataPoints, setDataPoints] = useState([]);

    useEffect(() => {
        const fetchDataPoints = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/field/${fieldId}/data-points`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setDataPoints(response.data);
            } catch (error) {
                console.error('Error fetching data points:', error);
            }
        };

        fetchDataPoints();
    }, [fieldId]);

    // Function to map profit to a color
    const getColorForProfit = (profit) => {
        // Define a color scale based on profit values
        // Adjust the range and colors as needed
        if (profit < 0) return '#FF0000'; // Red for negative profit
        if (profit < 100) return '#FFA500'; // Orange
        if (profit < 200) return '#FFFF00'; // Yellow
        return '#008000'; // Green for high profit
    };

    // Render the data points on a canvas or map
    return (
        <div className="map-container">
            {/* Example using an HTML5 Canvas */}
            <canvas id="profitCanvas" width="800" height="600"></canvas>
            {/* Alternatively, use a mapping library like Leaflet or Mapbox GL JS */}
            {/* For simplicity, here we just list the data points */}
            <ul>
                {dataPoints.map((point, index) => (
                    <li key={index} style={{ color: getColorForProfit(point.profit) }}>
                        Lat: {point.latitude}, Lon: {point.longitude}, Profit: {point.profit}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MapView;