import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './CreateAccountPage.css';

function CreateAccountPage() {
    // State to store form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        password: '',
        confirmPassword: '',
        nameOfFarm: '',
        fieldId: null
    });



    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission and password validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        let firstName = formData.firstName;
        let lastName = formData.lastName;
        let userName = formData.userName;
        let password = formData.password;
        let confirmPassword = formData.confirmPassword;
        let nameOfFarm = formData.nameOfFarm;
        let fieldId = null;


        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const userData = {
            firstName,
            lastName,
            userName,
            password,
            nameOfFarm,
            fieldId,
        };

        try {
            const response = await fetch('https://capstone-project-agridevs.onrender.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                alert('User registered successfully!');
            } else {
                const data = await response.json().catch(() => ({}));
                alert(data.error || 'Something went wrong!');
            }
        } catch (err) {
            console.error(err);
            alert('Error registering user');
        }
    };

    return (
        <div className="createAccountPage-container">
            <div className="backButton">
                <Link to="/Home">Back</Link>
            </div>

            <h2>Create a New Profit Map Account</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Name of Farm:</label>
                    <input
                        type="text"
                        name="nameOfFarm"
                        value={formData.nameOfFarm}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Create Account</button>
            </form>
        </div>
    );
}


export default CreateAccountPage;