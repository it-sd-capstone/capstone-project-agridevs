import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles/MapView.css';

const MapView = () => {
    const { fieldId } = useParams();
    const [dataPoints, setDataPoints] = useState([]);
    const [averageProfit, setAverageProfit] = useState(null);
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
                const [dataResponse, avgProfitResponse] = await Promise.all([
                    axios.get(
                        `${process.env.REACT_APP_API_BASE_URL}/field/${fieldId}/data-points`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    axios.get(
                        `${process.env.REACT_APP_API_BASE_URL}/field/${fieldId}/average-profit`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                ]);

                setDataPoints(dataResponse.data);
                setAverageProfit(avgProfitResponse.data.averageProfit);
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

    if (loading) return <p>Loading data...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="map-view">
            <h2>Field Data Visualization</h2>
            {averageProfit !== null && (
                <p className="average-profit">Average Profit: ${averageProfit.toFixed(2)}</p>
            )}
            <canvas id="profitCanvas" width="800" height="600"></canvas>
            <ul>
                {dataPoints.map((point, index) => (
                    <li key={index} style={{ color: getColorForProfit(point.profit) }}>
                        Lat: {point.latitude}, Lon: {point.longitude}, Profit: {point.profit}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MapView;