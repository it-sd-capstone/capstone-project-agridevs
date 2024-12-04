import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
    const [costs, setCosts] = useState({
        fertilizer_cost: '',
        seed_cost: '',
        maintenance_cost: '',
        misc_cost: '',
        crop_price: '',
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCostChange = (e) => {
        setCosts({ ...costs, [e.target.name]: e.target.value });
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        // Validate cost inputs
        for (const key in costs) {
            if (costs[key] === '') {
                setError('Please fill in all cost fields.');
                return;
            }
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setError(null);
            const token = localStorage.getItem('token');
            console.log('JWT Token:', token); // Log the token for debugging

            if (!token) {
                console.error('No token found. Redirecting to login page.');
                navigate('/login');
                return;
            }

            // Upload yield data
            const yieldDataResponse = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/upload/yield-data`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const fieldId = yieldDataResponse.data.fieldId;

            // Submit costs
            const costsWithFieldId = { ...costs, fieldId };
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/costs/submit`,
                costsWithFieldId,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Calculate profit
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/profit/calculate/${fieldId}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Navigate to the map page after successful profit calculation
            navigate('/map');
        } catch (err) {
            console.error('Error uploading data:', err);

            if (err.response) {
                // The request was made, and the server responded with a status code
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                setError(`Error: ${err.response.data.error || 'Failed to upload data.'}`);
            } else if (err.request) {
                // The request was made, but no response was received
                console.error('Request made but no response:', err.request);
                setError('No response from server. Please try again later.');
            } else {
                // Something else happened
                console.error('Error:', err.message);
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="upload-page">
            <h2>Upload Yield Data and Enter Costs</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label>Upload Yield CSV File:</label>
                <input type="file" onChange={handleFileChange} accept=".csv" />
            </div>
            <div className="form-group">
                <label>Enter Costs:</label>
                <input
                    type="number"
                    name="fertilizer_cost"
                    placeholder="Fertilizer Cost"
                    value={costs.fertilizer_cost}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="seed_cost"
                    placeholder="Seed Cost"
                    value={costs.seed_cost}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="maintenance_cost"
                    placeholder="Maintenance Cost"
                    value={costs.maintenance_cost}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="misc_cost"
                    placeholder="Miscellaneous Cost"
                    value={costs.misc_cost}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="crop_price"
                    placeholder="Crop Price per Bushel"
                    value={costs.crop_price}
                    onChange={handleCostChange}
                />
            </div>
            <button className="upload-button" onClick={handleUpload}>
                Generate Profit Map
            </button>
        </div>
    );
};

export default UploadPage;