import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; // Make sure the import is correct
import CreateAccountPage from './CreateAccountPage'; // Correct the path and component name

function App() {

    useEffect(() => {
        // Redirect to /Home when app loads
        window.location.href = '/home';
    }, []);

    return (
        <Router>
            <Routes>
                {/* Route to Home Component */}
                <Route path="/Home" element={<Home />} />
                {/* Route to Create Account Component */}
                <Route path="/CreateAccountPage" element={<CreateAccountPage />} />
            </Routes>
        </Router>
    );
}

export default App;
