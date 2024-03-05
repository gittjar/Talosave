import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import AddRenovationForm from '../forms/AddRenovationForm.jsx';
import PropertyEditForm from '../forms/PropertyEditForm.jsx';
import DeleteConfirmation from '../notifications/DeleteConfirmation.jsx';
import PropertyRenovations from './PropertyRenovations.jsx';
import AddTodoForm from '../forms/AddTodoForm.jsx';
import Todos from './Todos.jsx';
import HouseBasicInformation from './HouseBasicInformation.jsx';
import { XLg, PencilSquare, ArrowLeft } from 'react-bootstrap-icons';
import { Tab, Nav } from 'react-bootstrap';
import ConsumptionDetails from './ConsumptionDetails.jsx';


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
  const [isOpen, setIsOpen] = useState(false); 
  const [isAddRenovationFormOpen, setIsAddRenovationFormOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showTodos, setShowTodos] = useState(false);






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

  const closeForm = () => {
    setIsAddRenovationFormOpen(false);
    setIsFormVisible(false); // Hide the form after it's submitted
    setIsOpen(false); // Reset the state of the "Avaa tehtävän lisäys" button

    
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
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
    <Nav variant="pills" className="flex-column nav-propertydetails">
      <Nav.Item>
        <Nav.Link eventKey="1" >Talo</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="2">Remontit</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="3">Tehtävät</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="4">Kulutus</Nav.Link>
      </Nav.Item>
    </Nav>
    <Tab.Content>
      <Tab.Pane eventKey="1">
          <button onClick={handleEditClick} className="edit-link" title="Muokkaa tietoja"><PencilSquare /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="delete-link" title="Poista kohde"><XLg /></button>
        <HouseBasicInformation property={property} />
      </Tab.Pane>
      <Tab.Pane eventKey="2">
      <div className='d-flex'>
      <AddRenovationForm propertyId={id} refreshData={refreshData} closeForm={closeForm} />
      <PropertyRenovations propertyId={id} />
      </div>
      </Tab.Pane>
      <Tab.Pane eventKey="3">
        <section className='todos'>
      <AddTodoForm propertyId={id} refreshData={refreshData} closeForm={closeForm}/>
      <Todos propertyId={id} />
      </section>
      </Tab.Pane>
      <Tab.Pane eventKey="4">
      <ConsumptionDetails property={property}>Kulutus</ ConsumptionDetails>
      </Tab.Pane>
    </Tab.Content>
  </Tab.Container>

         
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