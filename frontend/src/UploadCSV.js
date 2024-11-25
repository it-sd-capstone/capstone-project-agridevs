import React, { useState } from 'react';

function UploadCSV() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const response = await fetch('https://capstone-project-agridevs.onrender.com/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.text();
                setMessage(`Success: ${result}`);
            } else {
                setMessage(`Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            setMessage(`Failed to upload file: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Upload CSV File</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>Upload</button>
            </form>
            {loading && <p>Uploading...</p>}
            <p>{message}</p>
        </div>
    );
}

export default UploadCSV;
