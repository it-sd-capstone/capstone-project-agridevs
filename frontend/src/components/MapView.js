import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/MapView.css';
import FieldAverages from './FieldAverages'; // Import the new component

const MapView = () => {
    const [fieldBoundary, setFieldBoundary] = useState(null);
    const [dataPoints, setDataPoints] = useState(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFieldData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch field boundary
                const boundaryResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/field/boundary`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setFieldBoundary(boundaryResponse.data);

                // Fetch data points with profit
                const dataResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/field/data-points`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setDataPoints(dataResponse.data);
            } catch (error) {
                console.error('Error fetching field data:', error);
                // Handle errors as needed
            }
        };

        fetchFieldData();
    }, [navigate]);

    useEffect(() => {
        if (fieldBoundary && dataPoints) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Get bounding box
            const lats = fieldBoundary.map(coord => coord.latitude);
            const lons = fieldBoundary.map(coord => coord.longitude);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);

            // Canvas dimensions
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Helper functions to convert geo coords to canvas coords
            const geoToCanvasX = lon => ((lon - minLon) / (maxLon - minLon)) * canvasWidth;
            const geoToCanvasY = lat => canvasHeight - ((lat - minLat) / (maxLat - minLat)) * canvasHeight;

            // Clear canvas
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Draw field boundary
            ctx.beginPath();
            fieldBoundary.forEach((point, index) => {
                const x = geoToCanvasX(point.longitude);
                const y = geoToCanvasY(point.latitude);
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#f9f9f9';
            ctx.fill();

            // Draw data points
            dataPoints.forEach(point => {
                const x = geoToCanvasX(point.longitude);
                const y = geoToCanvasY(point.latitude);

                // Determine color based on profit
                let color;
                if (point.profit > 0) {
                    color = 'green';
                } else if (point.profit < 0) {
                    color = 'red';
                } else {
                    color = 'yellow';
                }

                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
            });
        }
    }, [fieldBoundary, dataPoints]);

    return (
        <div className="map-view">
            <h2>Field Visualization</h2>
            <div className="canvas-container">
                <canvas ref={canvasRef} width={800} height={600}></canvas>
                {/* Legend */}
                <div className="legend">
                    <div className="legend-item">
                        <div className="color-box" style={{ backgroundColor: 'green' }}></div>
                        <span>Profit &gt; 0</span>
                    </div>
                    <div className="legend-item">
                        <div className="color-box" style={{ backgroundColor: 'red' }}></div>
                        <span>Profit &lt; 0</span>
                    </div>
                    <div className="legend-item">
                        <div className="color-box" style={{ backgroundColor: 'yellow' }}></div>
                        <span>Profit = 0</span>
                    </div>
                </div>
            </div>
            {/* Display average yield and profit */}
            <FieldAverages />
        </div>
    );
};

export default MapView;