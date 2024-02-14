import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const MyPage = () => {
    const [properties, setProperties] = useState([]);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchProperties = async () => {
            const token = localStorage.getItem('userToken'); 

            const response = await axios.get('http://localhost:3000/api/properties', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setProperties(response.data);
        };

        fetchProperties();
    }, []);

    const handleAddProperty = () => {
        navigate('/add-property'); // Navigate to AddPropertyForm when button is clicked
    };

    return (
        <div>
            <h1>My Properties</h1>
            {properties.map(property => (
                <div key={property.id}>
                    <h2>{property.propertyname}</h2>
                    {/* Display other property details as needed */}
                </div>
            ))}
            <button onClick={handleAddProperty}>+ Add Property</button>
        </div>
    );
};

export default MyPage;