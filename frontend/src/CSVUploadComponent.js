import React, {useState} from "react";

function CSVUploadComponent() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a CSV file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
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
            setMessage(`Failed to upload: ${error.message}`);
        }
    };

    return (
        <div className="csv-upload-container">
            <h2>Upload CSV File</h2>
            <form onSubmit={handleUpload}>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default CSVUploadComponent;