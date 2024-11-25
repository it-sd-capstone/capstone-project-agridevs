import './App.css';
import React from 'react';
import TestComponent from './TestComponent';
import CSVUploadComponent from './CSVUploadComponent';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to Profit Map Web App</h1>
            </header>
            <div>
                <TestComponent />
            </div>
            <div>
                <CSVUploadComponent />
            </div>
        </div>
    );
}

export default App;