import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CreateAccountPage from './CreateAccountPage';
import './Home.css';
import TestComponent from './TestComponent';
import CSVUploadComponent from './CSVUploadComponent';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/createaccountpage" element={<CreateAccountPage />} />
            </Routes>
            <div>
                <TestComponent />
            </div>
            <div>
                <CSVUploadComponent />
            </div>
        </Router>
    );
}

document.getElementById("update-btn").addEventListener("click", () => {
    // Placeholder for Update functionality
    alert("Update button clicked! Implement logic here.");
  });
  
  document.getElementById("generate-btn").addEventListener("click", () => {
    // Placeholder for Generate functionality
    alert("Generate button clicked! Implement logic here.");
  });


export default App;