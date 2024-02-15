// AddPropertyForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { useProperties } from '../hooks/PropertyProvider.jsx';

const AddPropertyForm = () => {
    const { fetchProperties } = useProperties();
    const [propertyname, setPropertyname] = useState('');
    const navigate = useNavigate();
    const [userid, setUserid] = useState(null); // Add this line



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
            userid // Add userid to the data object
        };
    
        const token = localStorage.getItem('userToken'); 
    
        try {
            await axios.post('http://localhost:3000/api/properties', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/MyPage'); // Navigate to MyPage after form is submitted
        } catch (error) {
            console.error('Error adding property:', error);
            // Handle error as needed
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Property Name:
                <input type="text" value={propertyname} onChange={(e) => setPropertyname(e.target.value)} />
            </label>
            {/* Add other fields as needed */}
            <button type="submit" className='addbutton'>Add Property</button>
        </form>
    );
};

export default AddPropertyForm;