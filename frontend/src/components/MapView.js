import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles/MapView.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';

const MapView = () => {
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
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="map-container">
            <MapContainer
                center={[0, 0]} // Default center; will adjust based on GeoJSON
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
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