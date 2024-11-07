import React, { useState } from 'react';

function TestComponent() {
    const [message, setMessage] = useState('');

    const handleTestConnection = async () => {
        try {
            const response = await fetch('https://capstone-project-agridevs.onrender.com/test-db');
            if (response.ok) {
                const result = await response.text();
                setMessage(`Success: ${result}`);
            } else {
                setMessage(`Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            setMessage(`Failed to connect: ${error.message}`);
        }
    };

    return (
        <div>
            <button onClick={handleTestConnection}>Test Backend Connection</button>
            <p>{message}</p>
        </div>
    );
}

export default TestComponent;