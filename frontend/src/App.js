import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import UploadPage from './components/UploadPage';
import MapView from './components/MapView';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
    return (
        <Router>
            <Navbar />
            <div style={{ marginTop: '80px', minHeight: 'calc(100vh - 120px)' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/map/:fieldId" element={<MapView />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </div>
            <Footer />
        </Router>
    );
}

export default App;