import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './styles/UploadPage.css';

const UploadPage = () => {
    const [fieldName, setFieldName] = useState('');
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

        for (const key in costs) {
            if (costs[key] === '') {
                setError('Please fill in all cost fields.');
                return;
            }
        }

        if (!fieldName) {
            setError('Please provide a field name.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('field_name', fieldName);

        try {
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found. Redirecting to login page.');
                navigate('/login');
                return;
            }

            const yieldDataResponse = await axios.post(
                `${API_BASE_URL}/upload/yield-data`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const fieldId = yieldDataResponse.data.fieldId;
            const costsWithFieldId = { ...costs, fieldId };

            await axios.post(
                `${API_BASE_URL}/costs/submit`,
                costsWithFieldId,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await axios.post(
                `${API_BASE_URL}/profit/calculate/${fieldId}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate(`/map/${fieldId}`);
        } catch (err) {
            console.error('Error uploading data:', err);
            if (err.response) {
                setError(`Error: ${err.response.data.error || 'Failed to upload data.'}`);
            } else if (err.request) {
                setError('No response from server. Please try again later.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="upload-page">
            <h2>Upload Yield Data and Enter Costs</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="upload-section">
                <div className="left-section">
                    <label>Field Name:</label>
                    <input
                        type="text"
                        name="field_name"
                        placeholder="Field Name"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                    />
                    <label>Upload Yield CSV File:</label>
                    <input type="file" onChange={handleFileChange} accept=".csv" />
                </div>
                <div className="right-section">
                    <label>Fertilizer Cost:</label>
                    <input
                        type="number"
                        name="fertilizer_cost"
                        placeholder="Fertilizer Cost"
                        value={costs.fertilizer_cost}
                        onChange={handleCostChange}
                    />
                    <label>Seed Cost:</label>
                    <input
                        type="number"
                        name="seed_cost"
                        placeholder="Seed Cost"
                        value={costs.seed_cost}
                        onChange={handleCostChange}
                    />
                    <label>Maintenance Cost:</label>
                    <input
                        type="number"
                        name="maintenance_cost"
                        placeholder="Maintenance Cost"
                        value={costs.maintenance_cost}
                        onChange={handleCostChange}
                    />
                    <label>Miscellaneous Cost:</label>
                    <input
                        type="number"
                        name="misc_cost"
                        placeholder="Miscellaneous Cost"
                        value={costs.misc_cost}
                        onChange={handleCostChange}
                    />
                    <label>Crop Price per Bushel:</label>
                    <input
                        type="number"
                        name="crop_price"
                        placeholder="Crop Price per Bushel"
                        value={costs.crop_price}
                        onChange={handleCostChange}
                    />
                </div>
            </div>
            <button className="upload-button" onClick={handleUpload}>
                Generate Profit Map
            </button>
        </div>
    );
};

export default UploadPage;