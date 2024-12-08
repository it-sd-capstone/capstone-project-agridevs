import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const canvasRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const fieldId = new URLSearchParams(location.search).get('fieldId'); // Parse fieldId from URL

    // Fetch data from the backend
    useEffect(() => {
        const fetchProfitData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found. Redirecting to login page.');
                    navigate('/login');
                    return;
                }

                const endpoint = fieldId
                    ? `${process.env.REACT_APP_API_BASE_URL}/profit/geojson/${fieldId}`
                    : `${process.env.REACT_APP_API_BASE_URL}/profit/geojson`;

                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.features) {
                    setGeoJsonData(response.data);
                } else {
                    throw new Error('Invalid GeoJSON data format.');
                }
            } catch (error) {
                console.error('Error fetching GeoJSON data:', error);
                setError('An error occurred while fetching the profit data. Please try again later.');
            }
        };

        fetchProfitData();
    }, [navigate, fieldId]);

    // Render data onto canvas
    useEffect(() => {
        if (geoJsonData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Get bounding box of coordinates
            const latitudes = geoJsonData.features.map((f) => f.geometry.coordinates[1]);
            const longitudes = geoJsonData.features.map((f) => f.geometry.coordinates[0]);

            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Normalize and transform coordinates
            geoJsonData.features.forEach((feature) => {
                const [lng, lat] = feature.geometry.coordinates;
                const profit = feature.properties.profit;

                const x = ((lng - minLng) / (maxLng - minLng)) * canvasWidth;
                const y = canvasHeight - ((lat - minLat) / (maxLat - minLat)) * canvasHeight;

                const color = profit < 0 ? 'red' : profit > 0 ? 'green' : 'yellow';

                // Draw pixel on canvas
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 2, 2); // Adjust size of the pixel as needed
            });
        }
    }, [geoJsonData]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="map-view-container">
            <canvas ref={canvasRef} className="profit-canvas" width={800} height={600}></canvas>
            <div className="info-panel">
                <h2>Profit Map</h2>
                <p>Room for additional information such as legends or statistics.</p>
            </div>
        </div>
    );
};

export default MapView;