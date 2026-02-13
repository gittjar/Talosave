import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { createContext } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import PropertyEditForm from '../forms/PropertyEditForm.jsx';
import DeleteConfirmation from '../notifications/DeleteConfirmation.jsx';
import PropertyRenovations from './PropertyRenovations.jsx';
import Todos from './Todos.jsx';
import HouseBasicInformation from './HouseBasicInformation.jsx';
import { XLg, PencilSquare, BuildingUp, List } from 'react-bootstrap-icons';
import { Tab, Nav, Navbar, Offcanvas, Button, Badge } from 'react-bootstrap';
import ConsumptionDetails from './ConsumptionDetails.jsx';
import { HouseDoor, Tools, CardChecklist, BarChartFill, HouseCheck, Gear, CurrencyExchange, Lightning, ImageFill } from 'react-bootstrap-icons';
import ResearchPage from './ResearchPage.jsx';
import ChangeOwnerForm from '../forms/ChangeOwnerForm.jsx';
import ElectricityPrice from './ElectricityPrice.jsx';
import Services from './Services.jsx';
import PropertyImageUpload from '../forms/PropertyImageUpload.jsx';
import PropertyImageGallery from './PropertyImageGallery.jsx';

export const PropertyContext = createContext();

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const { fetchProperties } = useProperties();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeKey, setActiveKey] = useState("1");
  
  // Counts for navigation badges
  const [renovationsCount, setRenovationsCount] = useState(0);
  const [todosCount, setTodosCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [researchCount, setResearchCount] = useState(0);
  const [imagesCount, setImagesCount] = useState(0);
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
  const [isOpen, setIsOpen] = useState(false); 
  const [isAddRenovationFormOpen, setIsAddRenovationFormOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
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

  // Fetch counts for navigation badges
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    
    // Fetch renovations count
    fetch(`${config.baseURL}/api/renovations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setRenovationsCount(data.length))
      .catch(error => console.error('Error fetching renovations count:', error));

    // Fetch todos count
    fetch(`${config.baseURL}/api/todo/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setTodosCount(data.length))
      .catch(error => console.error('Error fetching todos count:', error));

    // Fetch services count
    fetch(`${config.baseURL}/api/services/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setServicesCount(data.length))
      .catch(error => console.error('Error fetching services count:', error));

    // Fetch research count
    fetch(`${config.baseURL}/api/files?propertyId=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setResearchCount(data.length))
      .catch(error => console.error('Error fetching research count:', error));

    // Fetch images count
    fetch(`${config.baseURL}/api/properties/${id}/images`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setImagesCount(data.length))
      .catch(error => console.error('Error fetching images count:', error));
  }, [id, refreshKey]);

  if (!property) {
    return <div>Loading...</div>;
  }

  const closeForm = () => {
    setIsAddRenovationFormOpen(false);
    setIsFormVisible(false); // Hide the form after it's submitted
    setIsOpen(false); // Reset the state of the "Avaa tehtävän lisäys" button
    setIsAddTodoFormVisible(false);
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

  // PUT
  const handleUpdateProperty = async () => {
    try {
      const token = localStorage.getItem('userToken');
      console.log('Token:', token); // Log the token
      console.log('PUT request data:', {
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
      });
  
      await axios.put(`${config.baseURL}/api/putProperty/${id}`, {
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
      refreshData(); // Refresh the property details
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

  // Navigation items configuration
  const navigationItems = [
    {
      key: "1",
      icon: <HouseDoor />,
      label: property?.propertyname || "Kohde",
      shortLabel: "Tiedot",
      count: null
    },
    {
      key: "9",
      icon: <ImageFill />,
      label: "Kuvat",
      shortLabel: "Kuvat",
      count: imagesCount
    },
    {
      key: "2", 
      icon: <Tools />,
      label: "Remontit",
      shortLabel: "Remontit",
      count: renovationsCount
    },
    {
      key: "3",
      icon: <CardChecklist />,
      label: "Tehtävät", 
      shortLabel: "Tehtävät",
      count: todosCount
    },
    {
      key: "4",
      icon: <Gear />,
      label: "Huollot",
      shortLabel: "Huollot",
      count: servicesCount
    },
    {
      key: "5",
      icon: <BarChartFill />,
      label: "Kulutus",
      shortLabel: "Kulutus",
      count: null
    },
    {
      key: "6",
      icon: <HouseCheck />,
      label: "Tutkimukset",
      shortLabel: "Tutkimukset",
      count: researchCount
    },
    {
      key: "7",
      icon: <CurrencyExchange />,
      label: "Verot ja muut maksut",
      shortLabel: "Verot",
      count: null
    },
    {
      key: "8",
      icon: <Lightning />,
      label: "Pörssisähkö",
      shortLabel: "Sähkö",
      count: null
    }
  ];

  const handleNavSelect = (selectedKey) => {
    setActiveKey(selectedKey);
    setShowMobileNav(false); // Close mobile menu when item is selected
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  // refreshData function
  const refreshData = () => {
    const token = localStorage.getItem('userToken');
  
    // Refresh property details
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

    // Refresh counts
    fetch(`${config.baseURL}/api/renovations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setRenovationsCount(data.length))
      .catch(error => console.error('Error refreshing renovations count:', error));

    fetch(`${config.baseURL}/api/todo/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setTodosCount(data.length))
      .catch(error => console.error('Error refreshing todos count:', error));

    fetch(`${config.baseURL}/api/services/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setServicesCount(data.length))
      .catch(error => console.error('Error refreshing services count:', error));

    fetch(`${config.baseURL}/api/files?propertyId=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setResearchCount(data.length))
      .catch(error => console.error('Error refreshing research count:', error));

    fetch(`${config.baseURL}/api/properties/${id}/images`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => setImagesCount(data.length))
      .catch(error => console.error('Error refreshing images count:', error));
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
          <Tab.Container activeKey={activeKey} onSelect={handleNavSelect}>
            {/* Mobile Navigation */}
            <div className="d-lg-none mb-3">
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <h5 className="mb-0">
                  {navigationItems.find(item => item.key === activeKey)?.icon}
                  <span className="ms-2">
                    {navigationItems.find(item => item.key === activeKey)?.shortLabel}
                  </span>
                </h5>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowMobileNav(true)}
                  aria-label="Avaa navigaatio"
                >
                  <List size={20} />
                </Button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <Nav variant="pills" className="nav nav-propertydetails d-none d-lg-flex">
              {navigationItems.map(item => (
                <Nav.Item key={item.key}>
                  <Nav.Link eventKey={item.key} className='navlinkpills d-flex align-items-center'>
                    {item.icon} 
                    <span className="ms-1">{item.label}</span>
                    {item.count !== null && item.count > 0 && (
                      <Badge 
                        bg={activeKey === item.key ? "light" : "secondary"}
                        text={activeKey === item.key ? "dark" : "light"}
                        className="ms-2" 
                        pill
                      >
                        {item.count}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            {/* Mobile Off-canvas Menu */}
            <Offcanvas 
              show={showMobileNav} 
              onHide={() => setShowMobileNav(false)}
              placement="start"
              className="d-lg-none"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>Navigaatio</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="flex-column" activeKey={activeKey} onSelect={handleNavSelect}>
                  {navigationItems.map(item => (
                    <Nav.Item key={item.key} className="mb-2">
                      <Nav.Link 
                        eventKey={item.key} 
                        className="d-flex align-items-center justify-content-between p-3 rounded"
                        style={{
                          backgroundColor: activeKey === item.key ? '#e7f3ff' : 'transparent',
                          border: activeKey === item.key ? '1px solid #0d6efd' : '1px solid transparent'
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <span className="me-3">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.count !== null && item.count > 0 && (
                          <Badge 
                            bg={activeKey === item.key ? "light" : "secondary"}
                            text={activeKey === item.key ? "dark" : "light"}
                            pill
                          >
                            {item.count}
                          </Badge>
                        )}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Offcanvas.Body>
            </Offcanvas>
   
   

    <Tab.Content>
      <Tab.Pane eventKey="1">
          <button onClick={handleEditClick} className="edit-link" title="Muokkaa tietoja"><PencilSquare /> Muokkaa</button>
          <br />
          <button onClick={() => setShowDeleteConfirm(true)} className="delete-link" title="Poista kohde"><XLg /> Poista</button>
          <br />
          <button onClick={() => setIsChangeOwnerFormVisible(!isChangeOwnerFormVisible)} className='edit-link' title='Vaihda omistaja'><BuildingUp /> Siirrä omistajuus</button>
          
          {isChangeOwnerFormVisible && <ChangeOwnerForm propertyId={id} />}
          
        <HouseBasicInformation property={property} />
      </Tab.Pane>
      <Tab.Pane eventKey="2">
      <section className='renovations'>
        <PropertyRenovations propertyId={id} refreshData={refreshData} />
    </section>

      </Tab.Pane>
      <Tab.Pane eventKey="3">
      <section className=''>

        <Todos propertyId={id} refreshData={refreshData} closeForm={closeForm}/>
    </section>
      </Tab.Pane>
      <Tab.Pane eventKey="4">
        <Services propertyId={id} />
      </Tab.Pane>
      <Tab.Pane eventKey="5">
      <ConsumptionDetails property={property}>Kulutus</ ConsumptionDetails>
      </Tab.Pane>
      <Tab.Pane eventKey="6">
      <ResearchPage propertyId={id} />
      </Tab.Pane>

      <Tab.Pane eventKey="7">
      <h1>Verot ja muut maksut</h1>
      <p>Tähän tulee verotietojen tiedot, oma komponentti</p>
      </Tab.Pane>
      
      <Tab.Pane eventKey="8">
      <ElectricityPrice />
      </Tab.Pane>

      <Tab.Pane eventKey="9">
        <PropertyImageUpload 
          propertyId={id} 
          onUploadSuccess={() => {
            document.dispatchEvent(new CustomEvent('property-image-uploaded', { 
              detail: { propertyId: id } 
            }));
            refreshData();
          }} 
        />
        <PropertyImageGallery propertyId={id} />
      </Tab.Pane>
    </Tab.Content>
  </Tab.Container>
     
        </section>
      )}
  {showDeleteConfirm && (
  <DeleteConfirmation 
    handleDeleteProperty={handleDeleteProperty} 
    setShowDeleteConfirm={setShowDeleteConfirm}
    fileName={property.propertyname}
  />
)}

    </div>
  );
};

export default PropertyDetails;