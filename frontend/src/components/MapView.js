import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const [map, setMap] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const fieldId = new URLSearchParams(location.search).get('fieldId'); // Parse fieldId from URL

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

    useEffect(() => {
        if (!map) {
            // Initialize the map only once
            const initialMap = L.map('map', {
                center: [0, 0], // Default center
                zoom: 2, // Default zoom level
            });

            // Add a base layer (plain white canvas with grid lines)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            }).addTo(initialMap);

            setMap(initialMap);
        }
    }, [map]);

    useEffect(() => {
        if (map && geoJsonData) {
            // Clear existing layers
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.LayerGroup) {
                    map.removeLayer(layer);
                }
            });

            const layerGroup = L.layerGroup().addTo(map);

            // Add GeoJSON data to the map
            geoJsonData.features.forEach((feature) => {
                const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

                // Create a circle marker with color based on profit
                const circleMarker = L.circleMarker(latlng, {
                    radius: 5,
                    fillColor:
                        feature.properties.profit < 0
                            ? 'red'
                            : feature.properties.profit > 0
                                ? 'green'
                                : 'yellow',
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                }).bindPopup(`Profit: $${feature.properties.profit.toFixed(2)}`);

                layerGroup.addLayer(circleMarker);
            });

            // Adjust map bounds to fit all points
            const bounds = layerGroup.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }
    }, [map, geoJsonData]);

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