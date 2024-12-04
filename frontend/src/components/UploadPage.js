import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
    const [costs, setCosts] = useState({ fertilizer: '', seed: '', maintenance: '', misc: '', cropPrice: '' });
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

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fertilizer_cost', costs.fertilizer);
        formData.append('seed_cost', costs.seed);
        formData.append('maintenance_cost', costs.maintenance);
        formData.append('misc_cost', costs.misc);
        formData.append('crop_price', costs.cropPrice);

        try {
            setError(null);
            // Upload yield data
            const response = await axios.post('/upload/yield-data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Calculate profit
            await axios.post(`/calculate/${response.data.fieldId}`);

            // Navigate to the map page after successful profit calculation
            navigate('/view-map');
        } catch (err) {
            console.error('Error uploading data:', err);
            setError('An error occurred while uploading data and generating the profit map.');
        }
    };

    return (
        <div className="upload-page">
            <h2>Upload Yield Data and Enter Costs</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label>Upload Yield CSV File:</label>
                <input type="file" onChange={handleFileChange} />
            </div>
            <div className="form-group">
                <label>Enter Costs:</label>
                <input
                    type="number"
                    name="fertilizer"
                    placeholder="Fertilizer Cost"
                    value={costs.fertilizer}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="seed"
                    placeholder="Seed Cost"
                    value={costs.seed}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="maintenance"
                    placeholder="Maintenance Cost"
                    value={costs.maintenance}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="misc"
                    placeholder="Miscellaneous Cost"
                    value={costs.misc}
                    onChange={handleCostChange}
                />
                <input
                    type="number"
                    name="cropPrice"
                    placeholder="Crop Price per Bushel"
                    value={costs.cropPrice}
                    onChange={handleCostChange}
                />
            </div>
            <button className="upload-button" onClick={handleUpload}>Generate Profit Map</button>
        </div>
    );
};

export default UploadPage;
