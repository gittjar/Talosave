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
import { XLg, PencilSquare, BuildingUp } from 'react-bootstrap-icons';
import { Tab, Nav } from 'react-bootstrap';
import ConsumptionDetails from './ConsumptionDetails.jsx';
import { HouseDoor, Tools, CardChecklist, BarChartFill, HouseCheck } from 'react-bootstrap-icons';
import ResearchPage from './ResearchPage.jsx';
import ChangeOwnerForm from '../forms/ChangeOwnerForm.jsx';


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
  const [newCreatedAt, setNewCreatedAt] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRoomList, setNewRoomList] = useState('');
  const [newFloors, setNewFloors] = useState('');
  const [newDataconnection, setNewDataconnection] = useState('');
  const [newTVSystem, setNewTVSystem] = useState('');
  const [newDrain, setNewDrain] = useState('');
  const [newWater, setNewWater] = useState('');
  const [newElectricity, setNewElectricity] = useState('');
  const [newMainHeatSystem, setNewMainHeatSystem] = useState('');
  const [newSauna, setNewSauna] = useState('');
  const [newPipes, setNewPipes] = useState('');
  const [newRoofType, setNewRoofType] = useState('');
  const [newGround, setNewGround] = useState('');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newRasite, setNewRasite] = useState('');
  const [newRanta, setNewRanta] = useState('');
  const [newUserid, setNewUserid] = useState('');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);
  const [showRenovations, setShowRenovations] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 
  const [isAddRenovationFormOpen, setIsAddRenovationFormOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showTodos, setShowTodos] = useState(false);
  const [isAddTodoFormVisible, setIsAddTodoFormVisible] = useState(false);

  const [isChangeOwnerFormVisible, setIsChangeOwnerFormVisible] = useState(false);




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
    setIsAddTodoFormVisible(false);
  };

  const toggleAddTodoForm = () => {
    setIsAddTodoFormVisible(!isAddTodoFormVisible);
  };

  const toggleAddRenovationForm = () => {
    setIsAddRenovationFormOpen(!isAddRenovationFormOpen);
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
        living_sqm: newLivingSqm,
        created_at: newCreatedAt,
        description: newDescription,
        room_list: newRoomList,
        floors: newFloors,
        dataconnection: newDataconnection,
        TV_system: newTVSystem,
        drain: newDrain,
        water: newWater,
        electricity: newElectricity,
        main_heat_system: newMainHeatSystem,
        sauna: newSauna,
        pipes: newPipes,
        roof_type: newRoofType,
        ground: newGround,
        property_id: newPropertyId,
        rasite: newRasite,
        ranta: newRanta,
        userid: newUserid,
        latitude: newLatitude,
        longitude: newLongitude,


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
    setNewCreatedAt(property.created_at);
    setNewDescription(property.description);
    setNewRoomList(property.room_list);
    setNewFloors(property.floors);
    setNewDataconnection(property.dataconnection);
    setNewTVSystem(property.TV_system);
    setNewDrain(property.drain);
    setNewWater(property.water);
    setNewElectricity(property.electricity);
    setNewMainHeatSystem(property.main_heat_system);
    setNewSauna(property.sauna);
    setNewPipes(property.pipes);
    setNewRoofType(property.roof_type);
    setNewGround(property.ground);
    setNewPropertyId(property.property_id);
    setNewRasite(property.rasite);
    setNewRanta(property.ranta);
    setNewUserid(property.userid);
    setNewLatitude(property.latitude);
    setNewLongitude(property.longitude);
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
          newCreatedAt={newCreatedAt}
          setNewCreatedAt={setNewCreatedAt}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          newRoomList={newRoomList}
          setNewRoomList={setNewRoomList}
          newFloors={newFloors}
          setNewFloors={setNewFloors}
          newDataconnection={newDataconnection}
          setNewDataconnection={setNewDataconnection}
          newTVSystem={newTVSystem}
          setNewTVSystem={setNewTVSystem}
          newDrain={newDrain}
          setNewDrain={setNewDrain}
          newWater={newWater}
          setNewWater={setNewWater}
          newElectricity={newElectricity}
          setNewElectricity={setNewElectricity}
          newMainHeatSystem={newMainHeatSystem}
          setNewMainHeatSystem={setNewMainHeatSystem}
          newSauna={newSauna}
          setNewSauna={setNewSauna}
          newPipes={newPipes}
          setNewPipes={setNewPipes}
          newRoofType={newRoofType}
          setNewRoofType={setNewRoofType}
          newGround={newGround}
          setNewGround={setNewGround}
          newPropertyId={newPropertyId}
          setNewPropertyId={setNewPropertyId}
          newRasite={newRasite}
          setNewRasite={setNewRasite}
          newRanta={newRanta}
          setNewRanta={setNewRanta}
          newUserid={newUserid}
          setNewUserid={setNewUserid}
          newLatitude={newLatitude}
          setNewLatitude={setNewLatitude}
          newLongitude={newLongitude}
          setNewLongitude={setNewLongitude}
          
         
       />
      ) : (

        <section className='property-details'>
          
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
    <Nav variant="pills" className="flex-column nav-propertydetails">
      <Nav.Item>
        <Nav.Link eventKey="1" className='navlinkpills'><HouseDoor></HouseDoor> {property.propertyname}</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="2" className='navlinkpills'><Tools></Tools> Remontit</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="3" className='navlinkpills'><CardChecklist></CardChecklist> Tehtävät</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="4" className='navlinkpills'><BarChartFill></BarChartFill> Kulutus</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="5" className='navlinkpills'><HouseCheck></HouseCheck> Tutkimukset</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="6" className='navlinkpills' >Verot ja muut maksut</Nav.Link>
      </Nav.Item>
    </Nav>
   

    <Tab.Content>
      <Tab.Pane eventKey="1">
          <button onClick={handleEditClick} className="edit-link" title="Muokkaa tietoja"><PencilSquare /> Muokkaa</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="delete-link" title="Poista kohde"><XLg /> Poista</button>
          <button onClick={() => setIsChangeOwnerFormVisible(!isChangeOwnerFormVisible)} className='edit-link' title='Vaihda omistaja'><BuildingUp /> Siirrä omistajuus</button>
          {isChangeOwnerFormVisible && <ChangeOwnerForm propertyId={id} />}
          
        <HouseBasicInformation property={property} />
      </Tab.Pane>
      <Tab.Pane eventKey="2">
      <div>

      {isAddRenovationFormOpen ? (
      <AddRenovationForm propertyId={id} refreshData={refreshData} closeForm={closeForm} />
      ) : (
        <button className='edit-link mx-3 mb-3' onClick={toggleAddRenovationForm}><PencilSquare /> Lisää remontti</button>
      )}
      <PropertyRenovations propertyId={id} />
      </div>
      </Tab.Pane>
      <Tab.Pane eventKey="3">
      <section className='todos'>
          {isAddTodoFormVisible ? (
          <AddTodoForm propertyId={id} refreshData={refreshData} closeForm={closeForm}/>
        ) : (
          <button className='edit-link' onClick={toggleAddTodoForm}>Lisää tehtävä</button>
        )}
        <Todos propertyId={id} refreshData={refreshData} closeForm={closeForm}/>
    </section>
      </Tab.Pane>
      <Tab.Pane eventKey="4">
      <ConsumptionDetails property={property}>Kulutus</ ConsumptionDetails>
      </Tab.Pane>
      <Tab.Pane eventKey="5">
      <ResearchPage propertyId={id} />
      
     

      </Tab.Pane>

      <Tab.Pane eventKey="6">
      <h1>Verot ja muut maksut</h1>
      <p>Tähän tulee verotietojen tiedot, oma komponentti</p>
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