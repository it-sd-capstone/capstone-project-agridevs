import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/UploadPage.css';
import { API_BASE_URL } from '../config';

function UploadPage() {
    const [csvFile, setCsvFile] = useState(null);
    const [costs, setCosts] = useState({
        fertilizerCost: '',
        seedCost: '',
        maintenanceCost: '',
        miscCost: '',
        cropPrice: '',
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Handle file input change
    const handleFileChange = (e) => {
        setCsvFile(e.target.files[0]);
    };

    // Handle cost input changes
    const handleCostChange = (e) => {
        setCosts({ ...costs, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleGenerate = async () => {
        if (!csvFile) {
            setError('Please upload a CSV file.');
            return;
        }

        // Create FormData object for the CSV file
        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to continue.');
                return;
            }

            // Upload yield data
            const yieldDataResponse = await axios.post(`${API_BASE_URL}/upload/yield-data`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token,
                },
            });

            const fieldId = yieldDataResponse.data.fieldId;

            // Submit costs
            const costsWithFieldId = { ...costs, fieldId };
            await axios.post(`${API_BASE_URL}/costs/submit`, costsWithFieldId, {
                headers: {
                    Authorization: token,
                },
            });

            // Get profit data
            const response = await axios.get(`${API_BASE_URL}/profit/calculate/${fieldId}`, {
                headers: {
                    Authorization: token,
                },
            });

            const profitData = response.data;

            // Navigate to the MapView component with profit data
            navigate('/map', { state: { profitData } });
        } catch (err) {
            console.error('Error generating profit map:', err);
            setError('An error occurred while generating the profit map.');
        }
    };

    return (
        <div className="upload-page">
            <h2>Upload Yield Data and Enter Costs</h2>
            {error && <p className="error">{error}</p>}
            <div className="upload-section">
                <div className="left-section">
                    <label>Upload Yield CSV File:</label>
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <div className="right-section">
                    <label>Enter Costs:</label>
                    <input
                        type="number"
                        name="fertilizerCost"
                        placeholder="Fertilizer Cost"
                        value={costs.fertilizerCost}
                        onChange={handleCostChange}
                    />
                    <input
                        type="number"
                        name="seedCost"
                        placeholder="Seed Cost"
                        value={costs.seedCost}
                        onChange={handleCostChange}
                    />
                    <input
                        type="number"
                        name="maintenanceCost"
                        placeholder="Maintenance Cost"
                        value={costs.maintenanceCost}
                        onChange={handleCostChange}
                    />
                    <input
                        type="number"
                        name="miscCost"
                        placeholder="Miscellaneous Cost"
                        value={costs.miscCost}
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
            </div>
            <button onClick={handleGenerate}>Generate Profit Map</button>
        </div>
    );
}

export default UploadPage;