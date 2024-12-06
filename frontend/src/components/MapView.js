import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const { fieldId } = useParams();
    const [dataPoints, setDataPoints] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFieldData = async () => {
            if (!fieldId) {
                setError('No fieldId provided for MapView.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/field/${fieldId}/data-points`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setDataPoints(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching field data:', err);
                setError(err.response?.data?.error || 'Failed to fetch field data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFieldData();
    }, [fieldId]);

    const getColorForProfit = (profit) => {
        if (profit < 0) return '#FF0000'; // Red for loss
        if (profit < 100) return '#FFA500'; // Orange for low profit
        if (profit < 200) return '#FFFF00'; // Yellow for moderate profit
        return '#008000'; // Green for high profit
    };

    const renderMap = () => {
        const canvas = document.getElementById('profitCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dataPoints.forEach((point) => {
            const x = (point.longitude + 180) * (canvas.width / 360); // Simplistic mapping
            const y = (canvas.height / 2) - (point.latitude * (canvas.height / 180));
            ctx.fillStyle = getColorForProfit(point.profit);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    useEffect(() => {
        if (dataPoints.length > 0) renderMap();
    }, [dataPoints]);

    if (loading) return <p>Loading data...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="map-view">
            <h2>Field Data Visualization</h2>
            <canvas id="profitCanvas" width="800" height="600"></canvas>
        </div>
    );
};

export default MapView;