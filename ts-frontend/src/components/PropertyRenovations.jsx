import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import RenovationDetails from './RenovationDetails';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import DeleteConfirmation from '../notifications/DeleteConfirmation';
import DeleteDetailsConfirmation from '../notifications/DeleteDetailsConfirmation';
import EditRenovationForm from '../forms/EditRenovationForm.jsx';
import Accordion from 'react-bootstrap/Accordion';



const PropertyRenovations = ({ propertyId }) => {
  const [renovations, setRenovations] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteDetailsConfirm, setShowDeleteDetailsConfirm] = useState(false);
  const [renovationToDelete, setRenovationToDelete] = useState(null);
  //const [showForm, setShowForm] = useState(false);
  //const [renovation, setRenovation] = useState(null); // Assume this is your renovation data
  const [showFormId, setShowFormId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const handleShowForm = (id) => setShowFormId(id);
const handleCloseForm = () => setShowFormId(null);


  useEffect(() => {
    const token = localStorage.getItem('userToken'); // Assuming you store your token in localStorage

    fetch(`${config.baseURL}/api/renovations/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setRenovations(data))
      .catch(error => console.error('Error:', error));
  }, [propertyId]);

  const handleDeleteDetails = () => {
    const token = localStorage.getItem('userToken');

    fetch(`${config.baseURL}/api/renovationdetails/${renovationToDelete.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        deleteRenovation(renovationToDelete.id);
      })
      .catch(error => console.error('Error:', error));
  };

  
  const handleDeleteProperty = () => {
    const token = localStorage.getItem('userToken');

    fetch(`${config.baseURL}/api/renovationdetails/${renovationToDelete.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(details => {
        if (details.length > 0) {
          setShowDeleteDetailsConfirm(true);
        } else {
          deleteRenovation(renovationToDelete.id);
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const deleteRenovation = (id) => {
    const token = localStorage.getItem('userToken');

    fetch(`${config.baseURL}/api/renovations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        // Remove the deleted renovation from the state
        setRenovations(renovations.filter(renovation => renovation.id !== id));
      })
      .catch(error => console.error('Error:', error));
  };

  const handleEditRenovation = (updatedRenovation) => {
    const token = localStorage.getItem('userToken');
  
    fetch(`${config.baseURL}/api/renovations/${updatedRenovation.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedRenovation)
    })
      .then(() => {
        // Update the renovation in the state
        setRenovations(renovations.map(renovation => renovation.id === updatedRenovation.id ? updatedRenovation : renovation));
        setShowEditForm(false);
        handleCloseForm();
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      {showDeleteConfirm && <DeleteConfirmation handleDeleteProperty={handleDeleteProperty} setShowDeleteConfirm={setShowDeleteConfirm} />}
      {showDeleteDetailsConfirm && <DeleteDetailsConfirmation handleDeleteDetails={handleDeleteDetails} setShowDeleteDetailsConfirm={setShowDeleteDetailsConfirm} />}
      
      {renovations.length > 0 ? (
        <Card className="card">
          <Card.Header className="card-header">
            <h4>Remontit ja muutostyöt</h4>
          </Card.Header>
          <Accordion>
            {renovations.map((renovation, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>
                {renovation.construction_company} | {renovation.renovation} - {new Date(renovation.date).toLocaleDateString('fi-FI')}                  <Button className='edit-link' onClick={() => handleShowForm(renovation.id)}>
                    Muokkaa
                  </Button>
                  <Button className='delete-link' onClick={() => { setRenovationToDelete(renovation); setShowDeleteConfirm(true); }}>Poista</Button>
                </Accordion.Header>
                <Accordion.Body>
                  {showFormId === renovation.id && (
                    <EditRenovationForm renovation={renovation} handleEditRenovation={handleEditRenovation} />
                  )}
                  {(renovation.cost !== 0 && renovation.cost !== null) && <p className="cost">Kustannukset: {renovation.cost} €</p>}
                  <RenovationDetails renovationId={renovation.id} />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card>
      ) : (
        <p>No renovations found for this property.</p>
      )}
    </div>
  );

};
  
  export default PropertyRenovations;
