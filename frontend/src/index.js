import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

let rentCost = 0; // Waiting for field names for dynamic changes
let fertillizerCost = 0; // Waiting for field names for dynamic changes
let seedCost = 0; // Waiting for field names for dynamic changes
let maintenanceCost = 0; // Waiting for field names for dynamic changes
let miscCost = 0; // Waiting for field names for dynamic changes

let pricePerBushelCorn = 0; // Waiting for field names for dynamic changes
let pricePerBushelSoybeans = 0; // Waiting for field names for dynamic changes


// Change this to Price per acre
// To how much corn will cost and make for money
// Current yield * price of ___, subtract other expenses
let totalCosts = rentCost + fertillizerCost + seedCost + maintenanceCost + miscCost;
// let profitPerAcreCorn = (yieldPerAcreCorn * pricePerBushelCorn) - totalCosts;
// let profitPerAcreSoybeans = (yieldPerAcreSoybeans * pricePerBushelSoybeans) - totalCosts;

let cropType = "";
let gradientColor;

if (cropType === "corn") {
//     gradientColor = profitPerAcreCorn;
} else if (cropType === "soybeans") {
//     gradientColor = profitPerAcreSoybeans;
} else {
    console.error("Invalid crop type");
    gradientColor = null; // Default to null or a safe value
}

export const calculateGradientColor = (yldVolDry, prod) => {
    if (prod === 0) {
        console.error("Division by zero: 'prod' cannot be 0");
        return '(0, 0, 0)'; // Default color for invalid input
    }

    const gradientValue = yldVolDry / prod;

    if (gradientValue >= 5.16 && gradientColor <= 161.87) {

        gradientColor = '(255, 0, 0)';

    } else if (gradientValue >= 161.88 && gradientColor <= 191.50) {

        gradientColor = '(240, 47, 0)';

    } else if (gradientValue >= 191.51 && gradientColor <= 207.77) {

        gradientColor = '(255, 87, 51)';

    } else if (gradientValue >= 207.78 && gradientColor <= 220.26) {

        gradientColor = '(240, 240, 0)';

    } else if (gradientValue >= 220.27 && gradientColor <= 230.25) {

        gradientColor = '(193, 240, 0)';

    } else if (gradientValue >= 230.26 && gradientColor <= 241.34) {

        gradientColor = '(0, 255, 22)';

    } else if (gradientValue >= 242.35 && gradientColor <= 483.16) {

        gradientColor = '(0, 219, 19)';

    } else {
        gradientColor = '(0, 0, 0)';
    }
};

// Eventually change this to show for each square, or area.
console.log(gradientColor)
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
