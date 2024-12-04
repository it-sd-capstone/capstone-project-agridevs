import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles/MapView.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

const { BaseLayer } = LayersControl;

const MapView = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [userLocation, setUserLocation] = useState([37.7749, -122.4194]); // Default coordinates
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get user's current location using browser geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        }

        // Fetch profit data from backend
        const fetchProfitData = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('JWT Token:', token); // Log the token for debugging

                if (!token) {
                    console.error('No token found. Redirecting to login page.');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/profit/geojson`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Ensure 'Bearer' prefix is included
                    },
                });

                // Check if response is JSON
                if (
                    response.headers['content-type'] &&
                    response.headers['content-type'].includes('application/json')
                ) {
                    setGeoJsonData(response.data);
                } else {
                    throw new Error('Invalid response format: Expected JSON');
                }
            } catch (error) {
                console.error('Error fetching GeoJSON data:', error);

                if (error.response && error.response.status === 401) {
                    // Unauthorized access - redirect to login
                    navigate('/login');
                } else {
                    setError(
                        'An error occurred while fetching the profit data. Please try again later.'
                    );
                }
            }
        };

        fetchProfitData();
    }, [navigate]);

    // Custom component to adjust map bounds when data changes
    const MapBounds = () => {
        const map = useMap();

        useEffect(() => {
            if (geoJsonData) {
                const geoJsonLayer = L.geoJSON(geoJsonData);
                map.fitBounds(geoJsonLayer.getBounds());
            }
        }, [geoJsonData, map]);

        return null;
    };

    if (error) {
        return <div className="map-container error-message">{error}</div>;
    }

    return (
        <div className="map-container">
            <MapContainer
                center={userLocation}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <LayersControl position="topright">
                    {/* Satellite with Streets Layer */}
                    <BaseLayer checked name="Satellite with Roads">
                        <TileLayer
                            url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
                            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
                        />
                    </BaseLayer>

                    {/* Street Layer */}
                    <BaseLayer name="Streets">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                    </BaseLayer>
                </LayersControl>

                {/* Render GeoJSON data if available */}
                {geoJsonData && (
                    <>
                        <GeoJSON
                            data={geoJsonData}
                            pointToLayer={(feature, latlng) => {
                                return L.circleMarker(latlng, {
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
                                });
                            }}
                            onEachFeature={(feature, layer) => {
                                layer.bindPopup(`Profit: $${feature.properties.profit.toFixed(2)}`);
                            }}
                        />
                        <MapBounds />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default MapView;