import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import RenovationDetails from './RenovationDetails';
import Card from 'react-bootstrap/Card';
import DeleteConfirmation from '../notifications/DeleteConfirmation';
import DeleteDetailsConfirmation from '../notifications/DeleteDetailsConfirmation';
import EditRenovationForm from '../forms/EditRenovationForm.jsx';
import Accordion from 'react-bootstrap/Accordion';
import { XLg, PencilSquare } from 'react-bootstrap-icons';




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
    <div className='renovations'>
      {showDeleteConfirm && <DeleteConfirmation handleDeleteProperty={handleDeleteProperty} setShowDeleteConfirm={setShowDeleteConfirm} />}
      {showDeleteDetailsConfirm && <DeleteDetailsConfirmation handleDeleteDetails={handleDeleteDetails} setShowDeleteDetailsConfirm={setShowDeleteDetailsConfirm} />}
      
      {renovations.length > 0 ? (
        <Card className="card">
          <Card.Header className="card-header">
            <h4>Remontit ja muutostyöt</h4>
          </Card.Header>
          <Accordion>
            {
              Object.entries(
                renovations.reduce((groups, renovation) => {
                  const year = new Date(renovation.date).getFullYear();
                  if (!groups[year]) {
                    groups[year] = [];
                  }
                  groups[year].push(renovation);
                  return groups;
                }, {})
              )
              .sort(([yearA], [yearB]) => yearB - yearA)
              .map(([year, renovations], index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                  <h5 className='renovation-year'>
                  {year} </h5> Remonttikulut yhteensä: {renovations.reduce((total, renovation) => total + (renovation.cost || 0), 0)} €
                   
                  </Accordion.Header>
                  <Accordion.Body>
                    <Accordion>
                      {renovations.sort((a, b) => new Date(b.date) - new Date(a.date)).map((renovation, index) => (
                        <Accordion.Item eventKey={index.toString()} key={index}>
                          <Accordion.Header>
                            <span className="cost">
                              {renovation.cost !== 0 && renovation.cost !== null ? `${renovation.cost} €` : null}
                            </span>
                            <div className='otsikko'>
                              <div>
                                {renovation.construction_company} | {renovation.renovation} - {new Date(renovation.date).toLocaleDateString('fi-FI')}
                              </div>
                              <article className='edit-delete-icons'>
                                <span className='edit-link' onClick={() => handleShowForm(renovation.id)}>
                                  <PencilSquare></PencilSquare>  Muokkaa
                                </span>
                                <span className='delete-link' onClick={() => { setRenovationToDelete(renovation); setShowDeleteConfirm(true); }}>
                                  <XLg></XLg> Poista
                                </span>
                              </article>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {showFormId === renovation.id && (
                              <EditRenovationForm renovation={renovation} handleEditRenovation={handleEditRenovation} />
                            )}
                            <RenovationDetails renovationId={renovation.id} />
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              ))
            }
          </Accordion>
        </Card>
      ) : (
        <p>No renovations found for this property.</p>
      )}
    </div>
  );
}

export default PropertyRenovations;





