import React, { useState, useEffect } from 'react';
import MapGL, { Source, Layer } from 'react-map-gl';
import { MAPBOX_TOKEN, API_BASE_URL } from '../config';
import './styles/MapView.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import bbox from '@turf/bbox';

/* function MapView() {
    const [viewport, setViewport] = useState({
        latitude: 37.7749, // Default latitude
        longitude: -122.4194, // Default longitude
        zoom: 12,
    });
    const [fieldData, setFieldData] = useState(null);
    const location = useLocation();
    const { profitData } = location.state || {};

    useEffect(() => {
        const fetchFieldData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found. Please log in.');
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
                    geojsonData = response.data;
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
            } catch (err) {
                console.error('Error fetching field data:', err);
            }
        };

        fetchFieldData();
    }, [profitData]);

    return (
        <div className="map-container">
            <MapGL
                {...viewport}
                width="100%"
                height="100%"
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                onViewportChange={setViewport}
                mapboxApiAccessToken={MAPBOX_TOKEN}
            >
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
                                    0,
                                    '#FF0000',
                                    500,
                                    '#FFFF00',
                                    1000,
                                    '#00FF00',
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

export default MapView; */

// Attempt to make an easier map ****

const gridElement = document.getElementById('grid');
const fileInput = document.getElementById('fileInput');

// Function to color-code based on value
function getColor(value) {
    if (value < 0) return '#ff6666'; // Red for low values
    if (value < 350) return '#ffcc66'; // Orange for medium-low values
    if (value < 700) return '#ffff66'; // Yellow for medium values
    return '#66ff66'; // Green for high values
}

// Function to create the grid with explicit 10x10 constraints
function MapView(data) {
    gridElement.innerHTML = ''; // Clear any existing grid
    gridElement.style.gridTemplateColumns = 'repeat(10, 50px)';
    gridElement.style.gridTemplateRows = 'repeat(10, 50px)';

    for (let i = 0; i < 10; i++) { // Ensure 10 rows
        for (let j = 0; j < 10; j++) { // Ensure 10 columns
            const value = data[i] && data[i][j] !== undefined ? data[i][j] : 0; // Default to 0 if missing
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.backgroundColor = getColor(value); // Apply color
            cell.textContent = value; // Display value
            gridElement.appendChild(cell);
        }
    }
}

// Function to parse CSV
function parseCSV(content) {
    return content.split('\n').map(row => row.split(',').map(Number));
}

// Event listener for file input
fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result.trim();
        const gridData = parseCSV(csvContent);

        // Validate and pad the data for a 10x10 grid
        const paddedData = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => (gridData[i] && gridData[i][j] !== undefined ? gridData[i][j] : 0))
        );

        createGrid(paddedData);
    };
        reader.readAsText(file);
});
export default MapView;