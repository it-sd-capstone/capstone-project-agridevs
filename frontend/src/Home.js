import React from 'react';
import TestComponent from './TestComponent';
import CSVUploadComponent from './CSVUploadComponent';

function Home() {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <TestComponent />
            <CSVUploadComponent />
        </div>
    );
}

export default Home;
