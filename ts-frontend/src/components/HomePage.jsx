import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { 
  House, 
  Lightning, 
  Droplet, 
  Tools, 
  BarChart, 
  Shield, 
  Star, 
  ArrowRight,
  InfoCircle,
  PersonCheck,
  Key
} from 'react-bootstrap-icons';
import config from '../configuration/config';

const HomePage = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [index, setIndex] = useState(0);

  // Warm up the backend server on page load
  useEffect(() => {
    const warmupBackend = async () => {
      try {
        console.log('Warming up backend server...');
        await fetch(`${config.baseURL}/`, { method: 'GET' });
        console.log('Backend server is ready');
      } catch (error) {
        console.log('Backend warmup request sent (server may be starting)');
      }
    };
    warmupBackend();
  }, []);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleClick = () => {
    setShowInfo(prevShowInfo => !prevShowInfo);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-primary text-white py-4 mb-4">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6} className="mb-3 mb-lg-0">
              <div className="hero-content">
                <Badge bg="light" text="primary" className="mb-3 px-3 py-2 fs-6">
                  <Star className="me-2" size={16} />
                  TaloSave App Beta v.1.0
                </Badge>
                <h1 className="display-5 fw-bold mb-3">
                  Kiinteistöjen hallinta
                  <span className="text-warning d-block">yksinkertaiseksi</span>
                </h1>
                <p className="mb-3">
                  Moderni ratkaisu kiinteistöjen tietojen, kulutusten ja remonttien 
                  hallintaan. Kaikki tärkeä tieto yhdessä paikassa.
                </p>
                
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button 
                    as={Link} 
                    to="/login" 
                    size="lg" 
                    variant="warning"
                    className="d-flex align-items-center justify-content-center fw-bold"
                  >
                    <PersonCheck className="me-2" size={20} />
                    Aloita käyttö
                    <ArrowRight className="ms-2" size={16} />
                  </Button>
                  
                  <Button 
                    variant="outline-light" 
                    size="lg"
                    onClick={handleClick}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <InfoCircle className="me-2" size={20} />
                    {showInfo ? 'Piilota info' : 'Demo tiedot'}
                  </Button>
                </div>

                {/* Demo Info */}
                {showInfo && (
                  <div className="demo-info mt-4 p-4 bg-white bg-opacity-10 rounded-4 border border-light border-opacity-25">
                    <h5 className="d-flex align-items-center mb-3">
                      <Key className="me-2 text-warning" size={20} />
                      Demo kirjautuminen
                    </h5>
                    <div className="demo-credentials">
                      <p className="mb-2">
                        <strong>Käyttäjätunnus:</strong> 
                        <Badge bg="warning" text="dark" className="ms-2">smith</Badge>
                      </p>
                      <p className="mb-0">
                        <strong>Salasana:</strong> 
                        <Badge bg="warning" text="dark" className="ms-2">salasana</Badge>
                      </p>
                    </div>
                    <p className="small mt-3 mb-0 text-light opacity-75">
                      Voit kokeilla ohjelman kaikkia ominaisuuksia demo-tunnuksilla
                    </p>
                  </div>
                )}
              </div>
            </Col>

            <Col lg={6}>
              {/* Simple Carousel */}
              <div className="carousel-container position-relative">
                <div className="custom-indicators mb-3">
                  {[0, 1, 2, 3].map((i) => (
                    <button
                      key={i}
                      className={`custom-indicator ${i === index ? 'active' : ''}`}
                      onClick={() => setIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                
                <Carousel 
                  activeIndex={index} 
                  pause={false} 
                  onSelect={handleSelect} 
                  className="modern-carousel shadow-lg rounded-4 overflow-hidden"
                  indicators={false}
                  controls={true}
                >
                  <Carousel.Item>
                    <div className="carousel-image-container">
                      <img
                        className="d-block w-100 carousel-image"
                        src="/assets/images/kuva001.jpg"
                        alt="Tallenna rakennuksen tietoja"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" fill="%23e9ecef"/><text x="200" y="140" text-anchor="middle" dy=".3em" fill="%236c757d">Kuva 1</text></svg>';
                        }}
                      />
                      <div className="carousel-overlay"></div>
                    </div>
                    <Carousel.Caption className="modern-caption">
                      <div className="caption-content">
                        <h3 className="fw-bold mb-2">Tallenna rakennuksen tietoja</h3>
                        <p className="lead mb-2">Helppo ja kattava kiinteistöjen hallinta</p>
                      </div>
                    </Carousel.Caption>
                  </Carousel.Item>
                  
                  <Carousel.Item>
                    <div className="carousel-image-container">
                      <img
                        className="d-block w-100 carousel-image"
                        src="/assets/images/kuva002.jpg"
                        alt="Tallenna ja seuraa kulutustietoja"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" fill="%23e9ecef"/><text x="200" y="140" text-anchor="middle" dy=".3em" fill="%236c757d">Kuva 2</text></svg>';
                        }}
                      />
                      <div className="carousel-overlay"></div>
                    </div>
                    <Carousel.Caption className="modern-caption">
                      <div className="caption-content">
                        <h3 className="fw-bold mb-2">Tallenna ja seuraa kulutustietoja</h3>
                        <p className="lead mb-2">Älykäs kulutuksen seuranta</p>
                      </div>
                    </Carousel.Caption>
                  </Carousel.Item>
                  
                  <Carousel.Item>
                    <div className="carousel-image-container">
                      <img
                        className="d-block w-100 carousel-image"
                        src="/assets/images/kuva003.jpg"
                        alt="Pidä kirjaa tehtävistä"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" fill="%23e9ecef"/><text x="200" y="140" text-anchor="middle" dy=".3em" fill="%236c757d">Kuva 3</text></svg>';
                        }}
                      />
                      <div className="carousel-overlay"></div>
                    </div>
                    <Carousel.Caption className="modern-caption">
                      <div className="caption-content">
                        <h3 className="fw-bold mb-2">Pidä kirjaa tehtävistä</h3>
                        <p className="lead mb-2">Organisoi huoltotyöt</p>
                      </div>
                    </Carousel.Caption>
                  </Carousel.Item>
                  
                  <Carousel.Item>
                    <div className="carousel-image-container">
                      <img
                        className="d-block w-100 carousel-image"
                        src="/assets/images/kuva004.jpg"
                        alt="Kirjaa remontit ja kustannukset"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" fill="%23e9ecef"/><text x="200" y="140" text-anchor="middle" dy=".3em" fill="%236c757d">Kuva 4</text></svg>';
                        }}
                      />
                      <div className="carousel-overlay"></div>
                    </div>
                    <Carousel.Caption className="modern-caption">
                      <div className="caption-content">
                        <h3 className="fw-bold mb-2">Kirjaa remontit ja kustannukset</h3>
                        <p className="lead mb-2">Kattava remonttiseuranta</p>
                      </div>
                    </Carousel.Caption>
                  </Carousel.Item>
                </Carousel>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-3">
                Miksi valita TaloSave?
              </h2>
              <p className="lead text-muted">
                Kattava ratkaisu kiinteistöjen hallintaan modernilla käyttöliittymällä
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={3} md={6}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4">
                    <House size={40} />
                  </div>
                  <h5 className="fw-bold mb-3">Rakennuksen tiedot</h5>
                  <p className="text-muted mb-0">Tallenna ja hallinnoi kiinteistöjen perustietoja helposti</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4">
                    <BarChart size={40} />
                  </div>
                  <h5 className="fw-bold mb-3">Kulutusseuranta</h5>
                  <p className="text-muted mb-0">Seuraa sähkön, veden ja lämmön kulutusta reaaliajassa</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4">
                    <Tools size={40} />
                  </div>
                  <h5 className="fw-bold mb-3">Remonttien kirjaus</h5>
                  <p className="text-muted mb-0">Pidä kirjaa kaikista remonteista, kustannuksista ja aikatauluista</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4">
                    <Shield size={40} />
                  </div>
                  <h5 className="fw-bold mb-3">Turvallinen talletus</h5>
                  <p className="text-muted mb-0">Tiedot tallennetaan turvallisesti pilveen ja ovat aina saatavilla</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section bg-light py-5">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h3 className="fw-bold mb-3">Valmis aloittamaan?</h3>
              <p className="lead text-muted mb-4">
                Rekisteröidy käyttäjäksi tai kirjaudu sisään demo-tunnuksilla
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Button 
                  as={Link} 
                  to="/create-user" 
                  variant="primary" 
                  size="lg"
                  className="d-flex align-items-center justify-content-center"
                >
                  <PersonCheck className="me-2" size={20} />
                  Luo käyttäjätili
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  size="lg"
                  className="d-flex align-items-center justify-content-center"
                >
                  <Key className="me-2" size={20} />
                  Kirjaudu sisään
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;