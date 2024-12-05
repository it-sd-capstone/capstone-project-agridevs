import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Handle changes to the file input
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle changes to the cost inputs
    const handleCostChange = (e) => {
        setCosts({ ...costs, [e.target.name]: e.target.value });
    };

    // Validate all inputs
    const validateInputs = () => {
        if (!fieldName.trim()) {
            setError('Field name is required.');
            return false;
        }
        if (!file) {
            setError('Please upload a yield data CSV file.');
            return false;
        }
        for (const [key, value] of Object.entries(costs)) {
            if (!value || isNaN(parseFloat(value))) {
                setError(`Please provide a valid value for ${key.replace('_', ' ')}.`);
                return false;
            }
        }
        return true;
    };

    // Handle the upload process
    const handleUpload = async () => {
        if (!validateInputs()) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('field_name', fieldName);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to upload data.');
                navigate('/login');
                return;
            }

            // Upload yield data
            console.log('Uploading yield data...');
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

            const fieldId = yieldDataResponse.data.fieldId; // Ensure this value exists
            console.log(`Received fieldId: ${fieldId}`);
            if (!fieldId) {
                throw new Error('Field ID was not returned by the server.');
            }

            // Submit costs along with the field ID
            const costsWithFieldId = { ...costs, fieldId };
            console.log('Submitting costs:', costsWithFieldId);
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/costs/submit`,
                costsWithFieldId,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Navigate to the map page after successful profit calculation
            console.log(`Navigating to map page with fieldId: ${fieldId}`);
            navigate(`/map/${fieldId}`);
        } catch (err) {
            console.error('Error uploading data:', err);

            if (err.response) {
                setError(err.response.data.error || 'An error occurred while uploading data.');
            } else {
                setError('An error occurred. Please check your internet connection and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="upload-page">
            <h2>Upload Yield Data and Enter Costs</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label>Field Name:</label>
                <input
                    type="text"
                    name="field_name"
                    placeholder="Field Name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                />
            </div>
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
            <button className="upload-button" onClick={handleUpload} disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Generate Profit Map'}
            </button>
        </div>
    );
};

export default UploadPage;