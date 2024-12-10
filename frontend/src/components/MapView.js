import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [error, setError] = useState(null);
    const { fieldId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    const pointsRef = useRef([]);

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

        const latitudes = geoJsonData.features.map((f) => f.geometry.coordinates[1]);
        const longitudes = geoJsonData.features.map((f) => f.geometry.coordinates[0]);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        pointsRef.current = [];

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

            pointsRef.current.push({ x, y, width: 10, height: 10, profit });
        });

        ctx.restore();
    };

    useEffect(drawMap, [geoJsonData, scale, offset]);

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomFactor = 0.1;
        if (e.deltaY < 0) {
            setScale((prev) => Math.min(prev + zoomFactor, 10));
        } else {
            setScale((prev) => Math.max(prev - zoomFactor, 0.1));
        }
    };

    const handleMouseDown = (e) => {
        isPanning.current = true;
        panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const handleMouseMove = (e) => {
        if (isPanning.current) {
            const newX = e.clientX - panStart.current.x;
            const newY = e.clientY - panStart.current.y;
            setOffset({ x: newX, y: newY });
        } else {
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left - offset.x) / scale;
            const mouseY = (e.clientY - rect.top - offset.y) / scale;

            let hoveredPoint = null;
            for (const p of pointsRef.current) {
                if (
                    mouseX >= p.x &&
                    mouseX <= p.x + p.width &&
                    mouseY >= p.y &&
                    mouseY <= p.y + p.height
                ) {
                    hoveredPoint = p;
                    break;
                }
            }

            const tooltip = tooltipRef.current;
            if (hoveredPoint) {
                tooltip.style.display = 'block';
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY + 10 + 'px';
                tooltip.innerHTML = `Profit: $${hoveredPoint.profit.toFixed(2)}`;
            } else {
                tooltip.style.display = 'none';
            }
        }
    };

    const handleMouseUp = () => {
        isPanning.current = false;
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const title = geoJsonData?.title || (fieldId ? `Field ${fieldId}` : 'Your Farm');
    const avgProfit = geoJsonData?.avgProfit;
    const avgProfitText = avgProfit !== undefined && avgProfit !== null
        ? `Average Profit (per acre): $${avgProfit.toFixed(2)}`
        : '';

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
                <h2>{fieldId ? title : 'Your Farm'}</h2>
                {avgProfitText && <p>{avgProfitText}</p>}
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
            <div
                ref={tooltipRef}
                style={{
                    position: 'absolute',
                    display: 'none',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    fontSize: '0.9rem',
                    zIndex: 10,
                }}
            ></div>
        </div>
    );
};

export default MapView;