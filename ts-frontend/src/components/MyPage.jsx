// MyPage.jsx
import { useNavigate } from 'react-router-dom'; 
import { useProperties } from '../hooks/PropertyProvider.jsx';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { 
  Buildings, 
  Plus, 
  GeoAlt, 
  InfoCircle, 
  ArrowRight,
  HouseDoor
} from 'react-bootstrap-icons';

const MyPage = () => {
    const { properties, loading, fetchProperties } = useProperties();
    const navigate = useNavigate(); 

    const handleAddProperty = () => {
        navigate('/add-property'); 
    };

    return (
      <div className="my-page">
        <Container className="py-4">
          {/* Header Section */}
          <Row className="mb-4">
            <Col>
              <div className="page-header text-center mb-4">
                <div className="header-icon mb-3">
                  <Buildings size={32} className="text-primary" />
                </div>
                <h1 className="display-6 fw-bold text-dark mb-2">Minun kohteet</h1>
                <p className="text-muted">Hallitse kiinteistöjäsi yhdessä paikassa</p>
              </div>
            </Col>
          </Row>

          {/* Properties Grid */}
          {properties.length > 0 ? (
            <Row className="justify-content-center">
              <Col xs={12} lg={10} xl={8}>
                <Row className="g-4 mb-4 justify-content-center">
                  {properties.map(property => (
                    <Col key={`property-${property.id || property.propertyid}`} xs={12} sm={6} md={4}>
                      <Card className="property-card h-100 border-0 shadow-sm">
                        {/* Property Image */}
                        <div className="property-image-container">
                          <Card.Img 
                            variant="top" 
                            src="/assets/images/house-1.jpeg" 
                            alt={`${property.propertyname} image`}
                            className="property-image"
                          />
                          <div className="property-badge">
                            <Badge bg="primary" className="rounded-pill">
                              <HouseDoor size={12} className="me-1" />
                              Kiinteistö
                            </Badge>
                          </div>
                        </div>

                    {/* Property Content */}
                    <Card.Body className="d-flex flex-column p-3">
                      {/* Property Name */}
                      <Card.Title className="property-title mb-2">
                        {property.propertyname}
                      </Card.Title>

                      {/* Address */}
                      <div className="property-address mb-2">
                        <div className="d-flex align-items-center text-muted mb-1">
                          <GeoAlt size={14} className="me-2" />
                          <small>{property.street_address}</small>
                        </div>
                        <div className="text-muted">
                          <small>{property.post_number} {property.city}</small>
                        </div>
                      </div>

                      {/* Description */}
                      {property.description && (
                        <Card.Text className="property-description text-muted mb-3">
                          {property.description.length > 100 
                            ? `${property.description.substring(0, 100)}...` 
                            : property.description
                          }
                        </Card.Text>
                      )}

                      {/* Action Button */}
                      <div className="mt-auto">
                        <Button 
                          as={Link} 
                          to={`/properties/${property.propertyid}`}
                          variant="outline-primary" 
                          size="sm" 
                          className="w-100 property-action-btn"
                        >
                          <InfoCircle size={14} className="me-2" />
                          Talon tiedot
                          <ArrowRight size={14} className="ms-auto" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
                </Row>
              </Col>
            </Row>
          ) : (
            /* Empty State */
            <Row className="justify-content-center mb-4">
              <Col xs={12} md={8} lg={6}>
                <Card className="empty-state-card border-0 shadow-sm text-center">
                  <Card.Body className="p-5">
                    <div className="empty-state-icon mb-3">
                      <Buildings size={48} className="text-muted" />
                    </div>
                    <h4 className="text-muted mb-3">Ei kiinteistöjä vielä</h4>
                    <p className="text-muted mb-4">
                      Lisää ensimmäinen kiinteistösi päästäksesi alkuun Talotieto-sovelluksen kanssa.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Add Property Button */}
          <Row className="justify-content-center">
            <Col xs={12} sm={8} md={6} lg={4}>
              <div className="text-center">
                <Button 
                  onClick={handleAddProperty} 
                  variant="primary" 
                  size="lg" 
                  className="add-property-btn fw-semibold"
                >
                  <Plus size={20} className="me-2" />
                  Lisää kiinteistö
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
};

export default MyPage;