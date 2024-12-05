import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FieldAverages = () => {
    const [averages, setAverages] = useState(null);

    useEffect(() => {
        const fetchAverages = async () => {
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/field/averages`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setAverages(response.data);
            } catch (error) {
                console.error('Error fetching field averages:', error);
            }
        };

        fetchAverages();
    }, []);

    if (!averages) {
        return <p>Loading averages...</p>;
    }

    return (
        <div className="field-averages">
            <p>Average Yield: {averages.average_yield.toFixed(2)}</p>
            <p>Average Profit: ${averages.average_profit.toFixed(2)}</p>
        </div>
    );
};

export default FieldAverages;