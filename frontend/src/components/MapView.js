import React, { useState, useEffect } from 'react';
import MapGL, { Source, Layer } from 'react-map-gl';
import { MAPBOX_TOKEN, API_BASE_URL } from '../config';
import './styles/MapView.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import bbox from '@turf/bbox';

function MapView() {
    const [viewport, setViewport] = useState({
        latitude: 37.7749, // Default latitude
        longitude: -122.4194, // Default longitude
        zoom: 12,
        width: '100%',
        height: '100%',
    });
    const [fieldData, setFieldData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { profitData } = location.state || {};

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found. Redirecting to login page.');
                    navigate('/login');
                    return;
                }

                let geojsonData;

                if (profitData) {
                    // If profitData is passed from UploadPage
                    geojsonData = profitData;
                } else {
                    // Fetch profit data from backend
                    const response = await axios.get(`${API_BASE_URL}/profit/geojson`, {
                        headers: {
                            Authorization: token,
                        },
                    });

                    if (response.headers['content-type'].includes('application/json')) {
                        geojsonData = response.data;
                    } else {
                        throw new Error('Invalid response format: Expected JSON');
                    }
                }

                setFieldData(geojsonData);

                // Adjust viewport to the field data's bounding box
                if (geojsonData && geojsonData.features && geojsonData.features.length > 0) {
                    const [minLng, minLat, maxLng, maxLat] = bbox(geojsonData);
                    setViewport((prevViewport) => ({
                        ...prevViewport,
                        latitude: (minLat + maxLat) / 2,
                        longitude: (minLng + maxLng) / 2,
                        zoom: 12,
                    }));
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching field data:', err);
                setError('An error occurred while fetching the field data. Please try again later.');
                setLoading(false);
            }
        })();
    }, [profitData, navigate]);

    if (loading) {
        return <div className="map-container">Loading map data...</div>;
    }

    if (error) {
        return <div className="map-container error-message">{error}</div>;
    }

    return (
        <div className="map-container">
            <MapGL
                {...viewport}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                onViewportChange={(newViewport) => setViewport(newViewport)}
                mapboxApiAccessToken={MAPBOX_TOKEN}
            >
                {/* Overlay the field data on the map */}
                {fieldData && (
                    <Source id="field-data" type="geojson" data={fieldData}>
                        <Layer
                            id="field-layer"
                            type="circle"
                            paint={{
                                'circle-color': [
                                    'interpolate',
                                    ['linear'],
                                    ['get', 'profit'],
                                    -1000, '#FF0000', // Red for negative profit
                                    0, '#FFFF00',     // Yellow for break-even
                                    1000, '#00FF00',  // Green for high profit
                                ],
                                'circle-radius': 5,
                                'circle-opacity': 0.8,
                            }}
                        />
                    </Source>
                )}
            </MapGL>
        </div>
    );
}

export default MapView;
