import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 


const AddPropertyForm = () => {
    const [propertyname, setPropertyname] = useState('');
    const [userid, setUserid] = useState(''); 
    const navigate = useNavigate(); 


    // When the component mounts, get the userid from local storage
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserid(storedUserId);
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const data = {
            propertyname,
            // No need to send userid
        };
    
        const token = localStorage.getItem('userToken'); 
    
        await axios.post('http://localhost:3000/api/properties', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/MyPage'); // Navigate to MyPage after form is submitted

    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Property Name:
                <input type="text" value={propertyname} onChange={(e) => setPropertyname(e.target.value)} />
            </label>
            {/* Add other fields as needed */}
            <button type="submit">Add Property</button>
        </form>
    );
};

export default AddPropertyForm;