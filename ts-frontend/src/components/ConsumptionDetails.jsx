import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Tab, Badge, Button } from 'react-bootstrap';
import { 
  Lightning, 
  Droplet, 
  Fire, 
  Trash,
  BarChart,
  ArrowLeft,
  GraphUp,
  Calendar,
  Activity
} from 'react-bootstrap-icons';
import ShowElectricityConsumption from '../consumptions/ShowElectricityConsumption';
import ShowHeatingConsumption from '../consumptions/ShowHeatingConsumption';
import ShowWaterConsumption from '../consumptions/ShowWaterConsumption';
const ConsumptionDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const consumptionTypes = [
    {
      key: 'electricity',
      title: 'Sähkökulutus',
      icon: <Lightning size={24} />,
      color: 'warning',
      description: 'Sähkön kulutus ja kustannukset',
      unit: 'kWh'
    },
    {
      key: 'heating',
      title: 'Lämmitys',
      icon: <Fire size={24} />,
      color: 'danger',
      description: 'Lämmitysenergian kulutus',
      unit: 'MWh'
    },
    {
      key: 'water',
      title: 'Vesikulutus',
      icon: <Droplet size={24} />,
      color: 'primary',
      description: 'Veden kulutus ja kustannukset',
      unit: 'm³'
    },
    {
      key: 'waste',
      title: 'Jätehuolto',
      icon: <Trash size={24} />,
      color: 'success',
      description: 'Jätehuollon kustannukset',
      unit: '€'
    }
  ];

  return (
    <div className="consumption-details">
      {/* Header Section */}
      <section className="consumption-header bg-gradient-primary text-white py-4 mb-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center mb-3">
                <Button 
                  as={Link} 
                  to={`/properties/${id}`}
                  variant="outline-light" 
                  size="sm"
                  className="me-3"
                >
                  <ArrowLeft size={16} className="me-2" />
                  Takaisin
                </Button>
                <Badge bg="light" text="primary" className="px-3 py-2">
                  <Activity className="me-2" size={16} />
                  Kulutusseuranta
                </Badge>
              </div>
              
              <h1 className="display-6 fw-bold mb-3 d-flex align-items-center">
                <GraphUp className="me-3" size={32} />
                Kohteen kulutustiedot
              </h1>
              
              <p className="lead mb-0 opacity-90">
                Seuraa ja analysoi kiinteistösi energian- ja vedenkulutusta sekä kustannuksia
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Navigation Cards */}
      <section className="consumption-nav mb-4">
        <Container>
          <Row className="g-4">
            {consumptionTypes.map((type, index) => (
              <Col lg={3} md={6} key={type.key}>
                <Card 
                  className={`consumption-nav-card h-100 border-0 shadow-sm cursor-pointer ${activeTab === type.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(type.key)}
                >
                  <Card.Body className="text-center p-4">
                    <div className={`consumption-icon bg-${type.color} bg-opacity-10 text-${type.color} rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3`}>
                      {type.icon}
                    </div>
                    <h5 className="fw-bold mb-2">{type.title}</h5>
                    <p className="text-muted small mb-2">{type.description}</p>
                    <Badge bg={type.color} className="opacity-75">
                      {type.unit}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Tab Content */}
      <section className="consumption-content">
        <Container>
          <Tab.Container activeKey={activeTab}>
            <Tab.Content>
              {/* Overview Tab */}
              <Tab.Pane eventKey="overview">
                <Card className="overview-card border-0 shadow-sm">
                  <Card.Body className="p-5 text-center">
                    <div className="overview-content">
                      <div className="overview-icon mb-4">
                        <BarChart size={64} className="text-primary opacity-75" />
                      </div>
                      <h3 className="fw-bold mb-3">Kulutustietojen yleiskatsaus</h3>
                      <p className="lead text-muted mb-4">
                        Valitse yllä olevista kategorioista tarkasteltava kulutustyyppi
                      </p>
                      
                      <div className="overview-image mb-4">
                        <img 
                          src="/assets/images/kuva001.jpg"
                          alt="Kulutusseuranta"
                          className="img-fluid rounded-4 shadow"
                          style={{ maxWidth: '400px', width: '100%' }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e9ecef"/><text x="200" y="150" text-anchor="middle" dy=".3em" fill="%236c757d">Kulutuskuva</text></svg>';
                          }}
                        />
                      </div>
                      
                      <Row className="g-3 justify-content-center">
                        {consumptionTypes.slice(0, 3).map((type) => (
                          <Col sm={4} key={type.key}>
                            <Button
                              variant={`outline-${type.color}`}
                              onClick={() => setActiveTab(type.key)}
                              className="w-100 d-flex align-items-center justify-content-center"
                            >
                              {type.icon}
                              <span className="ms-2 d-none d-sm-inline">{type.title}</span>
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Electricity Tab */}
              <Tab.Pane eventKey="electricity">
                <Card className="content-card border-0 shadow-sm">
                  <Card.Header className="bg-warning bg-opacity-10 border-0 py-3">
                    <h4 className="mb-0 d-flex align-items-center text-warning">
                      <Lightning size={24} className="me-2" />
                      Sähkökulutus
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <ShowElectricityConsumption />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Heating Tab */}
              <Tab.Pane eventKey="heating">
                <Card className="content-card border-0 shadow-sm">
                  <Card.Header className="bg-danger bg-opacity-10 border-0 py-3">
                    <h4 className="mb-0 d-flex align-items-center text-danger">
                      <Fire size={24} className="me-2" />
                      Lämmitysenergian kulutus
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <ShowHeatingConsumption />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Water Tab */}
              <Tab.Pane eventKey="water">
                <Card className="content-card border-0 shadow-sm">
                  <Card.Header className="bg-primary bg-opacity-10 border-0 py-3">
                    <h4 className="mb-0 d-flex align-items-center text-primary">
                      <Droplet size={24} className="me-2" />
                      Vesikulutus
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <ShowWaterConsumption />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Waste Tab */}
              <Tab.Pane eventKey="waste">
                <Card className="content-card border-0 shadow-sm">
                  <Card.Header className="bg-success bg-opacity-10 border-0 py-3">
                    <h4 className="mb-0 d-flex align-items-center text-success">
                      <Trash size={24} className="me-2" />
                      Jätehuolto
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4 text-center">
                    <div className="coming-soon-content py-5">
                      <Trash size={48} className="text-success opacity-50 mb-3" />
                      <h5 className="fw-bold mb-3">Jätehuollon seuranta</h5>
                      <p className="text-muted mb-4">
                        Jätehuollon kustannusten seuranta on tulossa pian
                      </p>
                      <Badge bg="success" className="px-3 py-2">
                        <Calendar size={14} className="me-2" />
                        Tulossa pian
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Container>
      </section>
    </div>
  );
};

export default ConsumptionDetails;