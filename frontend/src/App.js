import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import UploadPage from './components/UploadPage';
import MapView from './components/MapView';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import 'leaflet/dist/leaflet.css';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;