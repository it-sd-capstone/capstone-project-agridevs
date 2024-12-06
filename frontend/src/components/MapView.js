import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const mapRef = useRef(null);
    const canvasLayerRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const fieldId = new URLSearchParams(location.search).get('fieldId'); // Parse fieldId from URL

    // Fetch profit data
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

    // Initialize the map
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map', {
                center: [0, 0], // Default center
                zoom: 2, // Default zoom level
                zoomControl: true,
            });

            // Add a blank white background layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);

            // Add a canvas overlay
            canvasLayerRef.current = L.canvasLayer().addTo(mapRef.current);
        }
    }, []);

    // Draw pixels on the canvas
    useEffect(() => {
        if (geoJsonData && canvasLayerRef.current) {
            const canvas = canvasLayerRef.current._canvas;
            const ctx = canvas.getContext('2d');

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bounds = mapRef.current.getBounds();
            const scaleX = canvas.width / bounds.getEast() - bounds.getWest();
            const scaleY = canvas.height / bounds.getNorth() - bounds.getSouth();

            geoJsonData.features.forEach((feature, index) => {
                const lat = feature.geometry.coordinates[1];
                const lng = feature.geometry.coordinates[0];

                // Apply a small offset to prevent overlapping points
                const offsetLat = lat + index * 0.00005;
                const offsetLng = lng + index * 0.00005;

                // Project coordinates to canvas space
                const x = (offsetLng - bounds.getWest()) * scaleX;
                const y = (bounds.getNorth() - offsetLat) * scaleY;

                // Set color based on profit
                const profit = feature.properties.profit;
                const color =
                    profit < 0 ? 'red' : profit > 0 ? 'green' : 'yellow';

                // Paint a pixel (or small rectangle) for the point
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 2, 2); // Adjust size for visibility
            });
        }
    }, [geoJsonData]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="map-container">
            <div id="map" style={{ height: '100vh', width: '100%' }}></div>
        </div>
    );
};

export default MapView;