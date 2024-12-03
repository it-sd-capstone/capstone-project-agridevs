// frontend/src/components/MapView.js
import React, { useState, useEffect } from 'react';
import MapGL, { Source, Layer } from 'react-map-gl';
import { MAPBOX_TOKEN, API_BASE_URL } from '../config';
import './styles/MapView.css';
import axios from 'axios';
import bbox from '@turf/bbox';

function MapView() {
    const [viewport, setViewport] = useState({
        latitude: 37.7749, // Default latitude
        longitude: -122.4194, // Default longitude
        zoom: 12,
    });
    const [fieldData, setFieldData] = useState(null);

    useEffect(() => {
        const fetchFieldData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/profit/geojson`, {
                    headers: {
                        Authorization: token,
                    },
                });

                setFieldData(response.data);

                // Adjust viewport to the field data's bounding box
                if (response.data && response.data.features.length > 0) {
                    const [minLng, minLat, maxLng, maxLat] = bbox(response.data);
                    setViewport((prevViewport) => ({
                        ...prevViewport,
                        latitude: (minLat + maxLat) / 2,
                        longitude: (minLng + maxLng) / 2,
                        zoom: 12,
                    }));
                }
            } catch (err) {
                console.error('Error fetching field data:', err);
            }
        };

        fetchFieldData();
    }, []);

    return (
        <div className="map-container">
            <MapGL
                {...viewport}
                width="100%"
                height="100%"
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12" // Use satellite imagery with roads
                onViewportChange={setViewport}
                mapboxApiAccessToken={MAPBOX_TOKEN}
            >
                {fieldData && (
                    <Source id="field-data" type="geojson" data={fieldData}>
                        <Layer
                            id="field-layer"
                            type="fill"
                            paint={{
                                'fill-color': [
                                    'interpolate',
                                    ['linear'],
                                    ['get', 'profit'],
                                    0,
                                    '#FF0000', // Red for low profit
                                    500,
                                    '#FFFF00', // Yellow for medium profit
                                    1000,
                                    '#00FF00', // Green for high profit
                                ],
                                'fill-opacity': 0.7,
                            }}
                        />
                    </Source>
                )}
            </MapGL>
        </div>
    );
}

export default MapView;
