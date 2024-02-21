// AddPropertyForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { useProperties } from '../hooks/PropertyProvider.jsx';
import config from '../configuration/config.js';

const AddPropertyForm = () => {
    const { fetchProperties } = useProperties();
    const [propertyname, setPropertyname] = useState('');
    const navigate = useNavigate();
    const [userid, setUserid] = useState(null);

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
            userid 
        };
    
        const token = localStorage.getItem('userToken'); 
    
        try {
            await axios.post(`${config.baseURL}/api/post`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchProperties(); // Fetch properties again after a property is added
            navigate('/MyPage'); // Navigate to MyPage after form is submitted
        } catch (error) {
            console.error('Error adding property:', error.response.data);
            // Handle error as needed
        }
    };

    const goBack = () => {
        navigate(-1); // Go back to the previous page
      };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Property Name:<br></br>
                <input type="text" value={propertyname} onChange={(e) => setPropertyname(e.target.value)} />
            </label>
            <br></br>
            {/* Add other fields as needed */}
            <button type="submit" className='primary-button'>Add Property</button>
            <br></br>
            <button type="button" onClick={goBack} className='secondary-button'>Back</button> {/* Add a "Back" button */}

        </form>
    );
};

export default AddPropertyForm;