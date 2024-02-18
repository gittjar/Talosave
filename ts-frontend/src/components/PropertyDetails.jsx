import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';
import axios from 'axios';

export const PropertyContext = createContext();

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const { properties, fetchProperties } = useProperties();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('userToken');

    fetch(`http://localhost:3000/api/properties/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setProperty(data))
      .catch(error => {
        console.error('Error fetching property details:', error);
      });
  }, [id]);

  if (!property) {
    return <div>Loading...</div>;
  }

  const goBack = () => {
    navigate(-1);
  };

  const handleDeleteProperty = async () => {
    try {
      const token = localStorage.getItem('userToken'); 
      await axios.delete(`http://localhost:3000/api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchProperties(); 
      setShowDeleteConfirm(false); // Close the confirmation notification
      navigate('/mypage'); // Navigate to 'mypage'
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  return (
    <div>
      <h1>{property.propertyname}</h1>
      {/* Display other property details as needed */}
      <p>{property.description}</p>
      <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger">Delete</button> {/* Show the confirmation notification when "Delete" is clicked */}
      <button className="btn btn-primary" onClick={goBack}>Back</button>
      {showDeleteConfirm && (
        <div>
          <p>Are you sure you want to delete this property?</p>
          <button onClick={handleDeleteProperty} className='btn btn-success'>Yes</button> {/* Call handleDeleteProperty when "Yes" is clicked */}
          <button onClick={() => setShowDeleteConfirm(false)} className='btn btn-danger'>No</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;