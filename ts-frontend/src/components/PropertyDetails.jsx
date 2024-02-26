import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import AddRenovationForm from '../forms/AddRenovationForm.jsx';
import PropertyEditForm from '../forms/PropertyEditForm.jsx';
import DeleteConfirmation from '../notifications/DeleteConfirmation.jsx';
import PropertyRenovations from './PropertyRenovations.jsx';

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

  const [showRenovations, setShowRenovations] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Add this line



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

  // refreshData function
  const refreshData = () => {
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
        console.error('Error refreshing property details:', error);
      });
  };

  return (
    <div>
      {isEditing ? (
         <PropertyEditForm
         handleUpdateProperty={handleUpdateProperty}
         handleCancelClick={handleCancelClick}
         setNewPropertyName={setNewPropertyName}
         setNewStreetAddress={setNewStreetAddress}
         setNewPostNumber={setNewPostNumber}
         setNewCity={setNewCity}
         setNewLand={setNewLand}
         setNewHouseType={setNewHouseType}
         setNewBuildingYear={setNewBuildingYear}
         setNewTotalSqm={setNewTotalSqm}
         setNewLivingSqm={setNewLivingSqm}
         newPropertyName={newPropertyName}
         newStreetAddress={newStreetAddress}
         newPostNumber={newPostNumber}
         newCity={newCity}
         newLand={newLand}
         newHouseType={newHouseType}
         newBuildingYear={newBuildingYear}
         newTotalSqm={newTotalSqm}
         newLivingSqm={newLivingSqm}
       />
      ) : (
        <section className='property-details'>
          <article>
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
          <button onClick={() => setShowRenovations(!showRenovations)} className='primary-button'>Renovations</button>
          <button onClick={() => setIsOpen(!isOpen)} className='primary-button'>
        {isOpen ? 'Sulje remontin lisäys' : 'Avaa remontin lisäys'}
         </button>
         {isOpen && <AddRenovationForm propertyId={id} refreshData={refreshData} />}
          
          </article>

          <article>
            {showRenovations && <PropertyRenovations propertyId={id} />}

          </article>

        </section>
      )}
  {showDeleteConfirm && (
  <DeleteConfirmation 
    handleDeleteProperty={handleDeleteProperty} 
    setShowDeleteConfirm={setShowDeleteConfirm} 
  />
)}

    </div>
  );
};

export default PropertyDetails;