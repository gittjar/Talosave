import { useState, useEffect, useMemo } from 'react';
import config from '../configuration/config.js';
import RenovationDetails from './RenovationDetails';
import Card from 'react-bootstrap/Card';
import DeleteConfirmation from '../notifications/DeleteConfirmation';
import DeleteDetailsConfirmation from '../notifications/DeleteDetailsConfirmation';
import EditRenovationForm from '../forms/EditRenovationForm.jsx';
import Accordion from 'react-bootstrap/Accordion';
import { XLg, PencilSquare, WrenchAdjustable, Calendar3, FunnelFill } from 'react-bootstrap-icons';
import Badge from 'react-bootstrap/Badge';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
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
  const [selectedYear, setSelectedYear] = useState('all');


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

  // Calculate year statistics
  const yearStats = useMemo(() => {
    const stats = {};
    let totalAll = 0;
    let countAll = 0;

    renovations.forEach(renovation => {
      const year = new Date(renovation.date).getFullYear().toString();
      if (!stats[year]) {
        stats[year] = { count: 0, total: 0 };
      }
      stats[year].count += 1;
      stats[year].total += renovation.cost || 0;
      countAll += 1;
      totalAll += renovation.cost || 0;
    });

    stats['all'] = { count: countAll, total: totalAll };
    return stats;
  }, [renovations]);

  // Get unique years sorted
  const availableYears = useMemo(() => {
    return [...new Set(renovations.map(r => new Date(r.date).getFullYear()))]
      .sort((a, b) => b - a);
  }, [renovations]);

  // Filter renovations by selected year
  const filteredRenovations = useMemo(() => {
    if (selectedYear === 'all') return renovations;
    return renovations.filter(r => 
      new Date(r.date).getFullYear().toString() === selectedYear
    );
  }, [renovations, selectedYear]);

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
      {showDeleteConfirm && <DeleteConfirmation handleDeleteProperty={handleDeleteProperty} setShowDeleteConfirm={setShowDeleteConfirm} renovationName={renovationToDelete?.renovation} />}
      {showDeleteDetailsConfirm && <DeleteDetailsConfirmation handleDeleteDetails={handleDeleteDetails} setShowDeleteDetailsConfirm={setShowDeleteDetailsConfirm} />}

      {/* Modern Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
        <h3 className="mb-2 mb-md-0 text-primary d-flex align-items-center">
          <WrenchAdjustable className="me-2" size={24} />
          Remontit ja muutostyöt
        </h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary d-flex align-items-center"
        >
          <span className="me-2">+</span>
          Lisää remontti
        </button>
      </div>

      {/* Add Form Container */}
      {showAddForm && (
        <div className="mb-4">
          <AddRenovationForm propertyId={propertyId} refreshData={fetchRenovations} closeForm={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Year Filter Buttons */}
      {renovations.length > 0 && (
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <FunnelFill className="text-primary me-2" size={20} />
            <h5 className="mb-0 text-primary">Suodata vuoden mukaan</h5>
          </div>
          
          <div className="year-filter-container" style={{ overflowX: 'auto' }}>
            <ButtonGroup size="sm" className="mb-2">
              <Button
                variant={selectedYear === 'all' ? 'primary' : 'outline-primary'}
                onClick={() => setSelectedYear('all')}
                className="d-flex flex-column align-items-center px-3 py-2"
              >
                <div className="fw-bold">Kaikki</div>
                <small className="d-flex flex-column align-items-center mt-1">
                  <span>{yearStats['all']?.count || 0} kpl</span>
                  <span className="text-success fw-semibold">
                    {(yearStats['all']?.total || 0).toLocaleString('fi-FI')} €
                  </span>
                </small>
              </Button>
              
              {availableYears.map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year.toString() ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedYear(year.toString())}
                  className="d-flex flex-column align-items-center px-3 py-2"
                >
                  <div className="fw-bold">
                    <Calendar3 className="me-1" size={14} />
                    {year}
                  </div>
                  <small className="d-flex flex-column align-items-center mt-1">
                    <span>{yearStats[year]?.count || 0} kpl</span>
                    <span className="text-success fw-semibold">
                      {(yearStats[year]?.total || 0).toLocaleString('fi-FI')} €
                    </span>
                  </small>
                </Button>
              ))}
            </ButtonGroup>
          </div>
          
          {/* Summary for selected filter */}
          {selectedYear !== 'all' && (
            <div className="alert alert-info d-flex align-items-center mt-3">
              <Badge bg="primary" className="me-2 px-3 py-2">{selectedYear}</Badge>
              <span>
                Näytetään {yearStats[selectedYear]?.count || 0} remonttia, 
                yhteensä <strong>{(yearStats[selectedYear]?.total || 0).toLocaleString('fi-FI')} €</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {filteredRenovations.length > 0 ? (
        <div className="renovation-accordion">
          <Accordion flush>
            {
              Object.entries(
                filteredRenovations.reduce((groups, renovation) => {
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
                const isOver10YearsOld = renovations.some(renovation => {
                  const renovationYear = new Date(renovation.date).getFullYear();
                  const currentYear = new Date().getFullYear();
                  return (currentYear - renovationYear) >= 10;
                });

                return (
                  <Accordion.Item eventKey={index.toString()} key={index} className="mb-3 border-0 shadow-sm">
                    <Accordion.Header className="renovation-year-header">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 me-3">
                        {/* Year and Stats Row */}
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                          <Badge bg="primary" className="fs-6 me-3 px-3 py-2">
                            {year}
                          </Badge>
                          <div className="d-flex align-items-center text-muted">
                            <span className="me-3 d-flex align-items-center">
                              <WrenchAdjustable className="me-1" size={16} />
                              {renovations.length} remonttia
                            </span>
                            {isOver10YearsOld && (
                              <Badge bg="warning" text="dark" className="me-2">
                                +10v
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Cost Display */}
                        <div className="text-end">
                          <Badge bg="success" className="fs-6 px-3 py-2">
                            {totalCostForYear.toLocaleString('fi-FI')} €
                          </Badge>
                        </div>
                      </div>
                    </Accordion.Header>
                    
                    <Accordion.Body className="p-0">
                      <div className="renovation-items">
                        {renovations.sort((a, b) => new Date(b.date) - new Date(a.date)).map((renovation, renovationIndex) => (
                          <div key={renovationIndex} className="renovation-item border-bottom">
                            <Accordion>
                              <Accordion.Item eventKey="0" className="border-0">
                                <Accordion.Header className="renovation-detail-header">
                                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 me-3">
                                    {/* Main Info */}
                                    <div className="renovation-main-info mb-2 mb-md-0 flex-grow-1">
                                      <h6 className="mb-1 text-dark fw-bold">
                                        {renovation.renovation}
                                      </h6>
                                      <div className="d-flex flex-column flex-sm-row text-muted small">
                                        <span className="me-3 mb-1 mb-sm-0">
                                          <strong>Urakoitsija:</strong> {renovation.construction_company || 'Ei määritelty'}
                                        </span>
                                        <span className="me-3">
                                          <strong>Päivämäärä:</strong> {new Date(renovation.date).toLocaleDateString('fi-FI')}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Cost and Actions */}
                                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                                      {renovation.cost !== 0 && renovation.cost !== null && (
                                        <Badge bg="outline-success" text="success" className="me-2 mb-2 mb-sm-0 px-2 py-1">
                                          {renovation.cost.toLocaleString('fi-FI')} €
                                        </Badge>
                                      )}
                                      
                                      <div className="d-flex gap-2">
                                        <button
                                          className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowForm(renovation.id);
                                          }}
                                        >
                                          <PencilSquare size={14} className="me-1" />
                                          <span className="d-none d-sm-inline">Muokkaa</span>
                                        </button>
                                        <button
                                          className="btn btn-outline-danger btn-sm d-flex align-items-center"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setRenovationToDelete(renovation);
                                            setShowDeleteConfirm(true);
                                          }}
                                        >
                                          <XLg size={14} className="me-1" />
                                          <span className="d-none d-sm-inline">Poista</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </Accordion.Header>
                                
                                <Accordion.Body className="bg-light">
                                  {showFormId === renovation.id && (
                                    <div className="mb-3">
                                      <EditRenovationForm renovation={renovation} handleEditRenovation={handleEditRenovation} />
                                    </div>
                                  )}
                                  <RenovationDetails renovationId={renovation.id} />
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          </div>
                        ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })
            }
          </Accordion>
        </div>
      ) : (
        <div className="text-center py-5">
          <WrenchAdjustable size={48} className="text-muted mb-3" />
          <h5 className="text-muted">
            {selectedYear === 'all' 
              ? 'Ei remontteja löytynyt' 
              : `Ei remontteja vuodelta ${selectedYear}`}
          </h5>
          <p className="text-muted">
            {selectedYear === 'all' 
              ? 'Lisää ensimmäinen remontti ylläolevalla painikkeella.' 
              : 'Valitse toinen vuosi tai näytä kaikki remontit.'}
          </p>
          {selectedYear !== 'all' && (
            <Button 
              variant="outline-primary" 
              onClick={() => setSelectedYear('all')}
              className="mt-2"
            >
              Näytä kaikki remontit
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyRenovations;