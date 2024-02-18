import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';

export const PropertyContext = createContext();

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const { properties, fetchProperties } = useProperties();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('userToken');

    
    fetch(`${config.baseURL}/api/properties/${id}`, {
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
  }, [id, refreshKey]);

  if (!property) {
    return <div>Loading...</div>;
  }

  const goBack = () => {
    navigate(-1);
  };

  const handleDeleteProperty = async () => {
    try {
      const token = localStorage.getItem('userToken'); 
      await axios.delete(`${config.baseURL}/api/properties/${id}`, {
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

  const handleUpdateProperty = async () => {
    try {
      const token = localStorage.getItem('userToken'); 
      await axios.put(`${config.baseURL}/api/properties/${id}`, {
        propertyname: newPropertyName,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchProperties(); // Fetch properties again after a property is updated
      setIsEditing(false); // Switch back to the normal mode
      setRefreshKey(oldKey => oldKey + 1); // Trigger a refresh of the property details
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  };

  const handleEditClick = () => {
    setNewPropertyName(property.propertyname); // Initialize the form with the current property name
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={newPropertyName}
            onChange={(e) => setNewPropertyName(e.target.value)}
          />
          <button onClick={handleUpdateProperty} className="primary-button">Save</button>
          <button onClick={handleCancelClick} className="btn btn-danger">Cancel</button>
        </div>
      ) : (
        <div>
          <h1>{property.propertyname}</h1>
          {/* Display other property details as needed */}
          <p>{property.description}</p>
          <button onClick={handleEditClick} className="primary-button">Update</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="danger-button">Delete</button>
          <button className="secondary-button" onClick={goBack}>Back</button>
        </div>
      )}
      {showDeleteConfirm && (
        <div>
          <p>Are you sure you want to delete this property?</p>
          <button onClick={handleDeleteProperty} className='btn btn-success'>Yes</button>
          <button onClick={() => setShowDeleteConfirm(false)} className='btn btn-danger'>No</button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;