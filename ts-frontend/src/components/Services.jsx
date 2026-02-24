// Tämä komponentti on poistettu. Kaikki huoltotoiminnot löytyvät nyt Huoltokirja-välilehdeltä.
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table, ButtonGroup, Accordion, Collapse, Alert } from 'react-bootstrap';
import { PlusLg, Pencil, Trash, Calendar, Clock, CheckCircle, XCircle, ArrowRepeat, ChevronDown, ChevronRight, Person, Telephone, Envelope, FileText, Cash, ExclamationTriangle, Bell } from 'react-bootstrap-icons';
import config from '../configuration/config';
import AddServiceForm from '../forms/AddServiceForm';
import EditServiceForm from '../forms/EditServiceForm';
import DeleteConfirmationService from '../notifications/DeleteConfirmationService';
import { toast } from 'react-toastify';

const Services = () => {
  const { id } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedServices, setExpandedServices] = useState(new Set());

  useEffect(() => {
    fetchServices();
  }, [id]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${config.baseURL}/api/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Virhe huoltojen haussa');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${config.baseURL}/api/services/${deletingService.serviceid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Huolto poistettu onnistuneesti');
      setDeletingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Virhe huollon poistossa');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Suunniteltu': { bg: 'secondary', icon: <Clock size={14} /> },
      'Käynnissä': { bg: 'primary', icon: <ArrowRepeat size={14} /> },
      'Valmis': { bg: 'success', icon: <CheckCircle size={14} /> },
      'Peruttu': { bg: 'danger', icon: <XCircle size={14} /> }
    };
    const config = statusConfig[status] || statusConfig['Suunniteltu'];
    return <Badge bg={config.bg} className="d-flex align-items-center gap-1">{config.icon} {status}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Kiireellinen': 'danger',
      'Korkea': 'warning',
      'Normaali': 'info',
      'Matala': 'secondary'
    };
    return <Badge bg={priorityColors[priority] || 'secondary'}>{priority}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Check for invalid dates (like year 1900)
    if (date.getFullYear() < 2000) return '-';
    return date.toLocaleDateString('fi-FI');
  };

  const getDaysUntilService = (dateString) => {
    if (!dateString) return null;
    const serviceDate = new Date(dateString);
    if (serviceDate.getFullYear() < 2000) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    serviceDate.setHours(0, 0, 0, 0);
    const diffTime = serviceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUpcomingServices = () => {
    return services.filter(service => {
      if (!service.nextservicedate || service.status === 'Valmis' || service.status === 'Peruttu') return false;
      const days = getDaysUntilService(service.nextservicedate);
      return days !== null && days <= 30 && days >= 0;
    }).sort((a, b) => new Date(a.nextservicedate) - new Date(b.nextservicedate));
  };

  const getOverdueServices = () => {
    return services.filter(service => {
      if (!service.nextservicedate || service.status === 'Valmis' || service.status === 'Peruttu') return false;
      const days = getDaysUntilService(service.nextservicedate);
      return days !== null && days < 0;
    }).sort((a, b) => new Date(a.nextservicedate) - new Date(b.nextservicedate));
  };

  const toggleExpand = (serviceid) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceid)) {
        newSet.delete(serviceid);
      } else {
        newSet.add(serviceid);
      }
      return newSet;
    });
  };

  const filteredServices = services.filter(service => {
    if (filterStatus !== 'all' && service.status !== filterStatus) return false;
    if (filterType !== 'all' && service.servicetype !== filterType) return false;
    return true;
  });

  const serviceTypes = [...new Set(services.map(s => s.servicetype).filter(Boolean))];
  const statuses = ['Suunniteltu', 'Käynnissä', 'Valmis', 'Peruttu'];

  // Count services by status
  const getStatusCount = (status) => {
    if (status === 'all') return services.length;
    return services.filter(s => s.status === status).length;
  };

  // Count services by type
  const getTypeCount = (type) => {
    if (type === 'all') return services.length;
    return services.filter(s => s.servicetype === type).length;
  };

  if (loading) return <Container className="mt-4"><p>Ladataan huoltoja...</p></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Huollot</h3>
        <Button 
          variant="primary" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="d-flex align-items-center gap-2"
        >
          <PlusLg /> {showAddForm ? 'Sulje lomake' : 'Lisää huolto'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-4">
          <Card.Body>
            <AddServiceForm 
              propertyId={id} 
              onSuccess={() => {
                setShowAddForm(false);
                fetchServices();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </Card.Body>
        </Card>
      )}

      {editingService && (
        <Card className="mb-4">
          <Card.Body>
            <EditServiceForm
              service={editingService}
              onSuccess={() => {
                setEditingService(null);
                fetchServices();
              }}
              onCancel={() => setEditingService(null)}
            />
          </Card.Body>
        </Card>
      )}

      {/* Alerts for Upcoming and Overdue Services */}
      {getOverdueServices().length > 0 && (
        <Alert variant="danger" className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <ExclamationTriangle size={20} className="me-2" />
            <strong>Myöhässä olevat huollot ({getOverdueServices().length})</strong>
          </div>
          {getOverdueServices().map(service => (
            <div key={service.serviceid} className="mb-1">
              <Badge bg="dark" className="me-2">{service.servicetype}</Badge>
              <strong>{service.servicename}</strong> - Seuraava huolto oli: {formatDate(service.nextservicedate)}
              {' '}({Math.abs(getDaysUntilService(service.nextservicedate))} päivää myöhässä)
            </div>
          ))}
        </Alert>
      )}

      {getUpcomingServices().length > 0 && (
        <Alert variant="warning" className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <Bell size={20} className="me-2" />
            <strong>Tulevat huollot (30 päivän sisällä) ({getUpcomingServices().length})</strong>
          </div>
          {getUpcomingServices().map(service => {
            const days = getDaysUntilService(service.nextservicedate);
            return (
              <div key={service.serviceid} className="mb-1">
                <Badge bg="dark" className="me-2">{service.servicetype}</Badge>
                <strong>{service.servicename}</strong> - Seuraava huolto: {formatDate(service.nextservicedate)}
                {' '}({days} päivän päästä)
              </div>
            );
          })}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <label className="fw-bold mb-2 d-block">Tila:</label>
              <ButtonGroup size="sm">
                <Button 
                  variant={filterStatus === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilterStatus('all')}
                >
                  Kaikki <Badge bg="light" text="dark">{getStatusCount('all')}</Badge>
                </Button>
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'primary' : 'outline-primary'}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status} <Badge bg="light" text="dark">{getStatusCount(status)}</Badge>
                  </Button>
                ))}
              </ButtonGroup>
            </Col>
            <Col md={6}>
              <label className="fw-bold mb-2 d-block">Tyyppi:</label>
              <ButtonGroup size="sm">
                <Button 
                  variant={filterType === 'all' ? 'secondary' : 'outline-secondary'}
                  onClick={() => setFilterType('all')}
                >
                  Kaikki <Badge bg="light" text="dark">{getTypeCount('all')}</Badge>
                </Button>
                {serviceTypes.map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'secondary' : 'outline-secondary'}
                    onClick={() => setFilterType(type)}
                  >
                    {type} <Badge bg="light" text="dark">{getTypeCount(type)}</Badge>
                  </Button>
                ))}
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Services List */}
      <div className="services-list">
        {filteredServices.map(service => {
          const isExpanded = expandedServices.has(service.serviceid);
          
          return (
            <Card key={service.serviceid} className="mb-2 shadow-sm service-card">
              <Card.Body className="p-0">
                {/* Compact Header - Always Visible */}
                <div 
                  className="d-flex align-items-center p-3 cursor-pointer service-header"
                  onClick={() => toggleExpand(service.serviceid)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="me-2">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <h6 className="mb-0">{service.servicename}</h6>
                      <Badge bg="light" text="dark" className="fw-normal">
                        {service.servicetype || 'Määrittelemätön'}
                      </Badge>
                      {getStatusBadge(service.status)}
                      {service.priority && getPriorityBadge(service.priority)}
                      {service.isrecurring && (
                        <Badge bg="info" pill className="d-flex align-items-center gap-1">
                          <ArrowRepeat size={12} /> Toistuva
                        </Badge>
                      )}
                    </div>
                    {service.provider && (
                      <small className="text-muted d-block mt-1">
                        <Person size={14} /> {service.provider}
                      </small>
                    )}
                  </div>
                  
                  <div className="text-end ms-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">
                        <Calendar size={14} /> {formatDate(service.servicedate)}
                      </span>
                      {service.cost && (
                        <Badge bg="success" className="fw-bold">
                          {service.cost.toFixed(2)} €
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <Collapse in={isExpanded}>
                  <div className="px-3 pb-3 border-top">
                    <Row className="mt-3">
                      <Col md={6}>
                        {service.description && (
                          <div className="mb-3">
                            <strong className="d-block mb-1"><FileText size={14} /> Kuvaus:</strong>
                            <p className="text-muted mb-0">{service.description}</p>
                          </div>
                        )}
                        
                        {service.provider && (
                          <div className="mb-2">
                            <strong>Palveluntarjoaja:</strong>
                            <div className="ms-3">
                              <div><Person size={14} /> {service.provider}</div>
                              {service.contactperson && <div className="text-muted small">Yhteyshenkilö: {service.contactperson}</div>}
                              {service.phone && (
                                <div className="text-muted small">
                                  <Telephone size={12} /> {service.phone}
                                </div>
                              )}
                              {service.email && (
                                <div className="text-muted small">
                                  <Envelope size={12} /> {service.email}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Col>
                      
                      <Col md={6}>
                        <div className="mb-2">
                          <strong><Calendar size={14} /> Aikatiedot:</strong>
                          <div className="ms-3">
                            <div>Palvelupäivä: {formatDate(service.servicedate)}</div>
                            {service.nextservicedate && (
                              <div className="text-muted small">
                                Seuraava huolto: {formatDate(service.nextservicedate)}
                              </div>
                            )}
                            {service.isrecurring && service.recurringinterval && (
                              <div className="text-muted small">
                                Toistoväli: {service.recurringinterval} kk
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {service.cost && (
                          <div className="mb-2">
                            <strong><Cash size={14} /> Hinta:</strong>
                            <div className="ms-3">
                              {service.cost.toFixed(2)} {service.currency || 'EUR'}
                            </div>
                          </div>
                        )}
                        
                        {service.notes && (
                          <div className="mb-2">
                            <strong>Muistiinpanot:</strong>
                            <div className="ms-3 text-muted small">{service.notes}</div>
                          </div>
                        )}
                        
                        {service.documenturl && (
                          <div className="mb-2">
                            <strong>Dokumentti:</strong>
                            <div className="ms-3">
                              <a href={service.documenturl} target="_blank" rel="noopener noreferrer" className="small">
                                Avaa dokumentti
                              </a>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                    
                    <div className="d-flex gap-2 mt-3 pt-3 border-top">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingService(service);
                        }}
                      >
                        <Pencil size={14} /> Muokkaa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingService(service);
                        }}
                      >
                        <Trash size={14} /> Poista
                      </Button>
                    </div>
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">Ei huoltoja näytettäväksi</p>
          </Card.Body>
        </Card>
      )}

      {deletingService && (
        <DeleteConfirmationService
          service={deletingService}
          onConfirm={handleDelete}
          onCancel={() => setDeletingService(null)}
        />
      )}
    </Container>
  );
};

export default Services;
