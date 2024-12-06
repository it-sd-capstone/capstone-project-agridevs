import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles/MapView.css';

const MapView = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch profit data from backend
        const fetchProfitData = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    console.error('No token found. Redirecting to login page.');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/profit/geojson`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setGeoJsonData(response.data);
            } catch (error) {
                console.error('Error fetching GeoJSON data:', error);

                if (error.response && error.response.status === 401) {
                    navigate('/login'); // Unauthorized access
                } else {
                    setError('Failed to load profit data. Please try again later.');
                }
            }
        };

        fetchProfitData();
    }, [navigate]);

    useEffect(() => {
        if (geoJsonData) {
            const map = L.map('map').setView([0, 0], 2); // Default center and zoom
            L.tileLayer('', { // Blank background
                attribution: '',
                maxZoom: 18,
            }).addTo(map);

            // Iterate over GeoJSON data to create circle markers
            geoJsonData.features.forEach((feature) => {
                const { coordinates } = feature.geometry;
                const profit = feature.properties.profit;

                L.circleMarker([coordinates[1], coordinates[0]], {
                    radius: 5,
                    fillColor: profit > 0 ? 'green' : profit < 0 ? 'red' : 'yellow',
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                })
                    .addTo(map)
                    .bindPopup(`Profit: $${profit.toFixed(2)}`);
            });
        }
    }, [geoJsonData]);

    if (error) {
        return <div className="map-container error-message">{error}</div>;
    }

    return <div id="map" className="map-container"></div>;
};

export default MapView;