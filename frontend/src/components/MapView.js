import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const canvasRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [fieldName, setFieldName] = useState('Profit Map');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const fieldId = new URLSearchParams(location.search).get('fieldId');

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

                    // Extract fieldName from the GeoJSON data
                    if (response.data.features[0]?.properties?.fieldName) {
                        setFieldName(response.data.features[0].properties.fieldName);
                    }
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

                const x = ((lng - minLng) / (maxLng - minLng)) * (canvasWidth - 20) + 10;
                const y = canvasHeight - ((lat - minLat) / (maxLat - minLat)) * (canvasHeight - 20) - 10;

                // Determine color tiers
                let color = 'yellow';
                if (profit <= -500) color = 'darkred';
                else if (profit <= -250) color = 'red';
                else if (profit < -50) color = 'orange';
                else if (profit >= -50 && profit <= 50) color = 'yellow';
                else if (profit <= 250) color = 'lightgreen';
                else if (profit <= 500) color = 'green';
                else color = 'darkgreen';

                // Draw pixel on canvas
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 10, 10);
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
                <h2>{fieldName}</h2>
                <p>Room for additional information such as legends or statistics.</p>
                <div className="legend">
                    <h3>Legend</h3>
                    <div className="legend-item">
                        <span className="color-box darkred"></span> Less than -$500
                    </div>
                    <div className="legend-item">
                        <span className="color-box red"></span> -$500 to -$250
                    </div>
                    <div className="legend-item">
                        <span className="color-box orange"></span> -$250 to -$50
                    </div>
                    <div className="legend-item">
                        <span className="color-box yellow"></span> -$50 to $50
                    </div>
                    <div className="legend-item">
                        <span className="color-box lightgreen"></span> $50 to $250
                    </div>
                    <div className="legend-item">
                        <span className="color-box green"></span> $250 to $500
                    </div>
                    <div className="legend-item">
                        <span className="color-box darkgreen"></span> Greater than $500
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;