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
import ProgressBar from 'react-bootstrap/ProgressBar';
import { toast } from 'react-toastify';
import AddRenovationForm from '../forms/AddRenovationForm.jsx';
import RenovationImageUpload from '../forms/RenovationImageUpload.jsx';
import RenovationImageGallery from './RenovationImageGallery.jsx';

const PropertyRenovations = ({ propertyId, refreshData }) => {
  const [renovations, setRenovations] = useState([]);
  const [imageCounts, setImageCounts] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteDetailsConfirm, setShowDeleteDetailsConfirm] = useState(false);
  const [renovationToDelete, setRenovationToDelete] = useState(null);
  const [showFormId, setShowFormId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const handleShowForm = (id) => setShowFormId(id);
  const handleCloseForm = () => setShowFormId(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [storageQuota, setStorageQuota] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('userToken'); // Assuming you store your token in localStorage

    fetch(`${config.baseURL}/api/renovations/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setRenovations(data);
        // Hae kuvamäärät jokaiselle remontille
        data.forEach(renovation => {
          fetchImageCount(renovation.id);
        });
      })
      .catch(error => console.error('Error:', error));
  }, [propertyId]);

  // Fetch storage quota
  const fetchStorageQuota = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${config.baseURL}/api/storage-quota`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStorageQuota(data);
      } else {
        console.error('Failed to fetch storage quota');
      }
    } catch (error) {
      console.error('Error fetching storage quota:', error);
    }
  };

  useEffect(() => {
    fetchStorageQuota();
  }, []);

  const fetchImageCount = async (renovationId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${config.baseURL}/api/renovations/${renovationId}/images`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const images = await response.json();
      setImageCounts(prev => ({ ...prev, [renovationId]: images.length }));
    } catch (error) {
      console.error('Error fetching image count:', error);
    }
  };

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
        // Hae kuvamäärät jokaiselle remontille
        data.forEach(renovation => {
          fetchImageCount(renovation.id);
        });
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
        toast.success('Remontin tiedot päivitetty onnistuneesti!');
        fetchRenovations();
      })
      .catch(error => {
        console.error('Error:', error);
        toast.error('Remontin päivitys epäonnistui');
      });
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
                variant={selectedYear === 'all' ? 'dark' : 'outline-primary'}
                onClick={() => setSelectedYear('all')}
                className={`d-flex flex-column align-items-center px-3 py-2 year-filter-btn ${selectedYear === 'all' ? 'text-white' : 'text-dark'}`}
              >
                <div className="fw-bold">Kaikki</div>
                <small className="d-flex flex-column align-items-center mt-1">
                  <span>{yearStats['all']?.count || 0} kpl</span>
                  <span className={`price-text ${selectedYear === 'all' ? 'text-white' : 'text-primary'}`}>
                    {(yearStats['all']?.total || 0).toLocaleString('fi-FI')} €
                  </span>
                </small>
              </Button>
              
              {availableYears.map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year.toString() ? 'dark' : 'outline-primary'}
                  onClick={() => setSelectedYear(year.toString())}
                  className={`d-flex flex-column align-items-center px-3 py-2 year-filter-btn ${selectedYear === year.toString() ? 'text-white' : 'text-dark'}`}
                >
                  <div className="fw-bold">
                    <Calendar3 className="me-1" size={14} />
                    {year}
                  </div>
                  <small className="d-flex flex-column align-items-center mt-1">
                    <span>{yearStats[year]?.count || 0} kpl</span>
                    <span className={`price-text ${selectedYear === year.toString() ? 'text-white' : 'text-primary'}`}>
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
                          <div 
                            key={renovationIndex} 
                            className="renovation-item border-bottom mb-2"
                            style={{ 
                              backgroundColor: renovationIndex % 2 === 0 ? '#f8f9fa' : '#ffffff',
                              borderLeft: '4px solid #0d6efd',
                              marginLeft: '8px',
                              marginRight: '8px',
                              borderRadius: '4px'
                            }}
                          >
                            <Accordion className="mt-3">
                              <Accordion.Item eventKey="0" className="border-0" style={{ backgroundColor: 'transparent' }}>
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
                                        <span className="me-3">
                                          <strong>Kuvia:</strong> {imageCounts[renovation.id] || 0}
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
                                  {/* Edit Form at top of accordion body */}
                                  {showFormId === renovation.id ? (
                                    <div className="mb-4">
                                      <EditRenovationForm 
                                        renovation={renovation} 
                                        handleEditRenovation={handleEditRenovation}
                                        onCancel={handleCloseForm}
                                      />
                                    </div>
                                  ) : (
                                    <div className="mb-3">
                                      <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => handleShowForm(renovation.id)}
                                      >
                                        <PencilSquare className="me-2" />
                                        Muokkaa remonttia
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {/* Storage Quota Display */}
                                  {storageQuota && (
                                    <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                      <h6 style={{ marginBottom: '15px' }}>Tallennustilan käyttö</h6>
                                      
                                      {/* Renovation Images Quota */}
                                      <div style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                          <span style={{ fontWeight: '500' }}>Remonttikuvat</span>
                                          <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                            {storageQuota.renovationImages.usedMB.toFixed(1)} MB käytetty / {storageQuota.renovationImages.availableMB.toFixed(1)} MB jäljellä
                                          </span>
                                        </div>
                                        <ProgressBar 
                                          now={storageQuota.renovationImages.percentUsed} 
                                          variant={
                                            storageQuota.renovationImages.percentUsed >= 80 ? 'danger' : 
                                            storageQuota.renovationImages.percentUsed >= 60 ? 'warning' : 
                                            'success'
                                          }
                                          style={{ height: '20px' }}
                                          label={`${storageQuota.renovationImages.percentUsed.toFixed(1)}%`}
                                        />
                                      </div>

                                      {/* Total Quota */}
                                      <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                          <span style={{ fontWeight: '500' }}>Yhteensä (kaikki tiedostot)</span>
                                          <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                            {storageQuota.total.usedMB.toFixed(1)} MB käytetty / {storageQuota.total.availableMB.toFixed(1)} MB jäljellä
                                          </span>
                                        </div>
                                        <ProgressBar 
                                          now={storageQuota.total.percentUsed} 
                                          variant={
                                            storageQuota.total.percentUsed >= 80 ? 'danger' : 
                                            storageQuota.total.percentUsed >= 60 ? 'warning' : 
                                            'success'
                                          }
                                          style={{ height: '20px' }}
                                          label={`${storageQuota.total.percentUsed.toFixed(1)}%`}
                                        />
                                      </div>

                                      {storageQuota.total.percentUsed >= 80 && (
                                        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '0.9rem', color: '#856404' }}>
                                          ⚠️ Tallennustilasi on melkein täynnä. Poista vanhoja tiedostoja vapauttaaksesi tilaa.
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Image Upload and Gallery */}
                                  <div className="mb-4">
                                    <h6 className="mb-3">Kuvat</h6>
                                    <RenovationImageUpload 
                                      renovationId={renovation.id} 
                                      onUploadSuccess={() => {
                                        // Trigger gallery refresh
                                        document.dispatchEvent(new CustomEvent('renovation-image-uploaded', { 
                                          detail: { renovationId: renovation.id } 
                                        }));
                                        // Päivitä kuvamäärä
                                        fetchImageCount(renovation.id);
                                        // Päivitä quota
                                        fetchStorageQuota();
                                      }} 
                                    />
                                    <RenovationImageGallery renovationId={renovation.id} onUpdate={fetchStorageQuota} />
                                  </div>
                                  
                                  <hr />
                                  
                                  <div className="mt-4 mb-3">
                                    <h6 className="mb-3">Remonttidetaljit</h6>
                                    <RenovationDetails renovationId={renovation.id} />
                                  </div>
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