import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const canvasRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [fieldName, setFieldName] = useState('Profit Map');
    const [error, setError] = useState(null);
    const [avgProfit, setAvgProfit] = useState(null);
    const navigate = useNavigate();
    const { fieldId } = useParams();

    // Zoom & pan state
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchProfitData = async () => {
            try {
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
                    if (response.data.features[0]?.properties?.fieldName) {
                        setFieldName(response.data.features[0].properties.fieldName);
                    } else {
                        setFieldName(fieldId ? `Field ${fieldId}` : 'Entire Farm');
                    }
                    if (fieldId && response.data.avgProfit !== undefined) {
                        setAvgProfit(response.data.avgProfit);
                    }
                } else {
                    throw new Error('Invalid GeoJSON data format.');
                }
            } catch (err) {
                console.error('Error fetching GeoJSON data:', err);
                setError('An error occurred while fetching the profit data. Please try again later.');
            }
        };

        fetchProfitData();
    }, [navigate, fieldId, token]);

    const drawMap = () => {
        if (!geoJsonData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        // Get bounding box of coordinates
        const latitudes = geoJsonData.features.map((f) => f.geometry.coordinates[1]);
        const longitudes = geoJsonData.features.map((f) => f.geometry.coordinates[0]);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        geoJsonData.features.forEach((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            const profit = feature.properties.profit;

            const x = ((lng - minLng) / (maxLng - minLng)) * (canvasWidth - 20) + 10;
            const y = canvasHeight - ((lat - minLat) / (maxLat - minLat)) * (canvasHeight - 20) - 10;

            let color = 'yellow';
            if (profit <= -500) color = 'darkred';
            else if (profit <= -250) color = 'red';
            else if (profit < -50) color = 'orange';
            else if (profit >= -50 && profit <= 50) color = 'yellow';
            else if (profit <= 250) color = 'lightgreen';
            else if (profit <= 500) color = 'green';
            else color = 'darkgreen';

            ctx.fillStyle = color;
            ctx.fillRect(x, y, 10, 10);
        });

        ctx.restore();
    };

    useEffect(drawMap, [geoJsonData, scale, offset]);

    // Mouse wheel for zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const zoomFactor = 0.1;
        if (e.deltaY < 0) {
            setScale(prev => Math.min(prev + zoomFactor, 10));
        } else {
            setScale(prev => Math.max(prev - zoomFactor, 0.1));
        }
    };

    // Mouse drag for pan
    const handleMouseDown = (e) => {
        isPanning.current = true;
        panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const handleMouseMove = (e) => {
        if (isPanning.current) {
            const newX = e.clientX - panStart.current.x;
            const newY = e.clientY - panStart.current.y;
            setOffset({ x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        isPanning.current = false;
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="map-view-container">
            <canvas
                ref={canvasRef}
                className="profit-canvas"
                width={800}
                height={600}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            ></canvas>
            <div className="info-panel">
                <h2>{fieldName}</h2>
                {avgProfit !== null && (
                    <p><strong>Average Profit:</strong> ${avgProfit.toFixed(2)}</p>
                )}
                <p>Use mouse wheel to zoom and click-drag to pan.</p>
                <div className="legend">
                    <h3>Legend</h3>
                    <div className="legend-item">
                        <span className="color-box darkred"></span> Less than -$500
                    </div>
                    <div className="legend-item">
                        <span className="color-box red"></span> -$500 to -$250
                    </div>
                    <div className="legend-item">
                        <span className="color-box orange"></span> -$250 to -$50
                    </div>
                    <div className="legend-item">
                        <span className="color-box yellow"></span> -$50 to $50
                    </div>
                    <div className="legend-item">
                        <span className="color-box lightgreen"></span> $50 to $250
                    </div>
                    <div className="legend-item">
                        <span className="color-box green"></span> $250 to $500
                    </div>
                    <div className="legend-item">
                        <span className="color-box darkgreen"></span> Greater than $500
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;