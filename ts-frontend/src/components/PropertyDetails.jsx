import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import AddRenovationForm from '../forms/AddRenovationForm.jsx';

export const PropertyContext = createContext();

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const { fetchProperties } = useProperties();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newStreetAddress, setNewStreetAddress] = useState('');
  const [newPostNumber, setNewPostNumber] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newLand, setNewLand] = useState('');
  const [newHouseType, setNewHouseType] = useState('');
  const [newBuildingYear, setNewBuildingYear] = useState('');
  const [newTotalSqm, setNewTotalSqm] = useState('');
  const [newLivingSqm, setNewLivingSqm] = useState('');
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddRenovationForm, setShowAddRenovationForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');

    fetch(`${config.baseURL}/api/get/${id}`, {
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
      await axios.delete(`${config.baseURL}/api/delete/${id}`, {
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
      await axios.put(`${config.baseURL}/api/put/${id}`, {
        propertyname: newPropertyName,
        street_address: newStreetAddress,
        post_number: newPostNumber,
        city: newCity,
        land: newLand,
        house_type: newHouseType,
        building_year: newBuildingYear,
        total_sqm: newTotalSqm,
        living_sqm: newLivingSqm
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
    setNewStreetAddress(property.street_address);
    setNewPostNumber(property.post_number);
    setNewCity(property.city);
    setNewLand(property.land);
    setNewHouseType(property.house_type);
    setNewBuildingYear(property.building_year);
    setNewTotalSqm(property.total_sqm);
    setNewLivingSqm(property.living_sqm);
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
         <input
           type="text"
           value={newStreetAddress}
           onChange={(e) => setNewStreetAddress(e.target.value)}
           placeholder="New Street Address"
         />
         <input
           type="text"
           value={newPostNumber}
           onChange={(e) => setNewPostNumber(e.target.value)}
           placeholder="New Post Number"
         />
         <input
           type="text"
           value={newCity}
           onChange={(e) => setNewCity(e.target.value)}
           placeholder="New City"
         />
         <input
           type="text"
           value={newLand}
           onChange={(e) => setNewLand(e.target.value)}
           placeholder="New Land"
         />
         <input
           type="text"
           value={newHouseType}
           onChange={(e) => setNewHouseType(e.target.value)}
           placeholder="New House Type"
         />
         <input
           type="text"
           value={newBuildingYear}
           onChange={(e) => setNewBuildingYear(e.target.value)}
           placeholder="New Building Year"
         />
         <input
           type="text"
           value={newTotalSqm}
           onChange={(e) => setNewTotalSqm(e.target.value)}
           placeholder="New Total Sqm"
         />
         <input
           type="text"
           value={newLivingSqm}
           onChange={(e) => setNewLivingSqm(e.target.value)}
           placeholder="New Living Sqm"
         />
         <br />
         
         <button onClick={handleUpdateProperty} className="primary-button">Save</button>
         <button onClick={handleCancelClick} className="danger-button">Cancel</button>
       </div>
      ) : (
        <div>
          <h1>{property.propertyname}</h1>
          
          {property.street_address ? <p>Street Address: {property.street_address}</p> : null}
          {property.post_number ? <p>Post Number: {property.post_number}</p> : null}
          {property.city ? <p>City: {property.city}</p> : null}
          {property.land ? <p>Land: {property.land}</p> : null}
          {property.house_type ? <p>House Type: {property.house_type}</p> : null}
          {property.building_year ? <p>Building Year: {property.building_year}</p> : null}
          {property.total_sqm ? <p>Total Sqm: {property.total_sqm}</p> : null}
          {property.living_sqm ? <p>Living Sqm: {property.living_sqm}</p> : null}
          {property.created_at ? <p>Created At: {property.created_at}</p> : null}
          {property.description ? <p>Description: {property.description}</p> : null}
          <button onClick={handleEditClick} className="primary-button">Edit</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="danger-button">Delete</button>
          <button className="secondary-button" onClick={goBack}>Back</button>
          <article className='thinline'></article>
          <button onClick={() => setShowAddRenovationForm(!showAddRenovationForm)} className='primary-button'>+ Add Renovation</button>
        </div>
      )}
      {showDeleteConfirm && (
        <div className='confirmation'>
          <p>Are you sure you want to delete this property?</p>
          <button onClick={handleDeleteProperty} className="danger-button">Yes, delete</button>
          <button onClick={() => setShowDeleteConfirm(false)} className="secondary-button">No, cancel</button>
        </div>
      )}

          {showAddRenovationForm && <AddRenovationForm propertyId={id}/>}    
    </div>
  );
};

export default PropertyDetails;