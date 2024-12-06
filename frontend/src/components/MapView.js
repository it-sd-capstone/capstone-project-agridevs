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
                    console.log('GeoJSON Data Fetched:', response.data); // Debugging fetched data
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
            const initialMap = L.map('map', {
                center: [0, 0], // Default center
                zoom: 2, // Default zoom level
            });

            // Add Mapbox as the base layer
            L.tileLayer(
                `https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`,
                {
                    attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors',
                    tileSize: 512,
                    zoomOffset: -1,
                }
            ).addTo(initialMap);

            setMap(initialMap);
        }
    }, [map]);

    useEffect(() => {
        if (map && geoJsonData) {
            console.log('Rendering GeoJSON data to map...'); // Debugging rendering process
            const layerGroup = L.layerGroup().addTo(map);

            geoJsonData.features.forEach((feature, index) => {
                console.log('Feature:', feature); // Log each feature for debugging

                const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                const profit = feature.properties.profit;

                const color = profit < 0 ? 'red' : profit > 0 ? 'green' : 'yellow';

                // Offset lat/lng slightly to prevent overlapping points
                const adjustedLat = latlng[0] + index * 0.00005;
                const adjustedLng = latlng[1] + index * 0.00005;

                L.circleMarker([adjustedLat, adjustedLng], {
                    radius: 2, // Small radius for pixel-like display
                    fillColor: color,
                    fillOpacity: 1,
                    stroke: false,
                }).addTo(layerGroup);
            });

            // Fit bounds to all points
            const bounds = L.latLngBounds(
                geoJsonData.features.map((feature) => [
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0],
                ])
            );
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [20, 20] });
            } else {
                console.error('Invalid bounds for map.'); // Debugging bounds
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