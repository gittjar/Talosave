import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import RenovationDetails from './RenovationDetails';
import Card from 'react-bootstrap/Card';
import DeleteConfirmation from '../notifications/DeleteConfirmation';
import DeleteDetailsConfirmation from '../notifications/DeleteDetailsConfirmation';
import EditRenovationForm from '../forms/EditRenovationForm.jsx';
import Accordion from 'react-bootstrap/Accordion';
import { XLg, PencilSquare, WrenchAdjustable, SlashLg, ChevronRight } from 'react-bootstrap-icons';
import Badge from 'react-bootstrap/Badge'; // Import Badge from react-bootstrap
import { toast } from 'react-toastify';
import AddRenovationForm from '../forms/AddRenovationForm.jsx';

const PropertyRenovations = ({ propertyId, refreshData }) => {
  const [renovations, setRenovations] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteDetailsConfirm, setShowDeleteDetailsConfirm] = useState(false);
  const [renovationToDelete, setRenovationToDelete] = useState(null);
  const [showFormId, setShowFormId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const handleShowForm = (id) => setShowFormId(id);
  const handleCloseForm = () => setShowFormId(null);
  const [showAddForm, setShowAddForm] = useState(false);


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

  const fetchRenovations = () => {
    const token = localStorage.getItem('userToken'); // Assuming you store your token in localStorage

    fetch(`${config.baseURL}/api/renovations/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setRenovations(data);
        if (refreshData) {
          refreshData();
        }
      })
      .catch(error => console.error('Error:', error));
  };

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
        toast.success('Remontin tiedot poistettu onnistuneesti!');
      })
      .then(fetchRenovations)
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
          fetchRenovations();
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
        toast.success('Remontti poistettu onnistuneesti!');
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
        setRenovations(renovations.map(renovation => renovation.id === updatedRenovation.id ? updatedRenovation : renovation));
        setShowEditForm(false);
        handleCloseForm();
        closeForm();
        toast.success('Remontin tiedot päivitetty onnistuneesti!');
      })
      .then(fetchRenovations)
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className='renovations'>
    {showDeleteConfirm && <DeleteConfirmation handleDeleteProperty={handleDeleteProperty} setShowDeleteConfirm={setShowDeleteConfirm} />}
    {showDeleteDetailsConfirm && <DeleteDetailsConfirmation handleDeleteDetails={handleDeleteDetails} setShowDeleteDetailsConfirm={setShowDeleteDetailsConfirm} />}

    <button onClick={() => setShowAddForm(!showAddForm)} className='primary-button mx-3 mb-3'>
      {showAddForm ? 'Sulje remontin lisäyslomake' : 'Avaa remontin lisäyslomake'}
    </button>
<div className='renovation-header mx-3 mb-3'>
    {showAddForm && <AddRenovationForm  propertyId={propertyId} refreshData={fetchRenovations} closeForm={() => setShowAddForm(false)} />}
    </div>
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
              .map(([year, renovations], index) => {
                const totalCostForYear = renovations.reduce((total, renovation) => total + (renovation.cost || 0), 0);

                return (

         
                
                  <Accordion.Item eventKey={index.toString()} key={index}>


                    <Accordion.Header>
                      <div className='otsikko-renovations'>
                        <div className='renovation-year mb-1'>
                          {year}
                        </div> 
                        <SlashLg></SlashLg>
                        <div className='renovation-kpl'>
                         {renovations.length} <WrenchAdjustable></WrenchAdjustable>
                           
                        </div>
                        <SlashLg></SlashLg>
                        <p className="renovation-payment"> 
                          {totalCostForYear} €
                        </p>
                      </div>
                      <div className='over-10yrs-badge mx-2'>
                        {(() => {
                          const isOver10YearsOld = renovations.some(renovation => {
                            const renovationYear = new Date(renovation.date).getFullYear();
                            const currentYear = new Date().getFullYear();
                            const differenceInYears = currentYear - renovationYear;
                            return differenceInYears >= 10.01;
                          });

                          return isOver10YearsOld ? <Badge bg="warning">+10v</Badge> : null;
                        })()}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Accordion>
                        {renovations.sort((a, b) => new Date(b.date) - new Date(a.date)).map((renovation, index) => (
                          <Accordion.Item eventKey={index.toString()} key={index}>
                            <Accordion.Header>
                              <span className="cost">
                                {renovation.cost !== 0 && renovation.cost !== null ? `${renovation.cost} €` : null}
                              </span>
                              <div className=''>
                              <div className="renovation-card">
                                  <span className="company-name">{renovation.construction_company}</span>
                                  <ChevronRight></ChevronRight>
                                  <span className="renovation-name">{renovation.renovation}</span>
                                  <ChevronRight></ChevronRight>
                                  <span className='renovation-date'>{new Date(renovation.date).toLocaleDateString('fi-FI')}</span>
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
                );
              })
            }
          </Accordion>
        </Card>
      ) : (
        <p>No renovations found for this property.</p>
      )}
    </div>
  );
};

export default PropertyRenovations;