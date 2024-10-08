import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';

const HomePage = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  const handleClick = () => {
    setShowInfo(prevShowInfo => !prevShowInfo);
  };

  return (
    <div>
      <div className="custom-indicators mt-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`custom-indicator ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      
      <Carousel activeIndex={index} pause={false} onSelect={handleSelect} className="custom-carousel">
        <Carousel.Item>
          <img
            className="d-block w-100 img-fluid"
            src="../assets/images/IMG_2727.WEBP"
            alt="First slide"
          />
          <div className="carousel-caption d-none d-md-block">
            <h5>Tallenna rakennuksen tietoja</h5>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 img-fluid"
            src="../assets/images/IMG_2728.WEBP"
            alt="Second slide"
          />
          <div className="carousel-caption d-none d-md-block">
            <h5>Tallenna ja seuraa kulutustietoja</h5>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 img-fluid"
            src="../assets/images/IMG_2729.WEBP"
            alt="Third slide"
          />
          <div className="carousel-caption d-none d-md-block">
            <h5>Pidä kirjaa tehtävistä</h5>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 img-fluid"
            src="../assets/images/IMG_2730.WEBP"
            alt="Fourth slide"
          />
          <div className="carousel-caption d-none d-md-block">
            <h5>Kirjaa remontit, summat, ajankohdat ja lisätiedot</h5>
          </div>
        </Carousel.Item>
      </Carousel>

      <button className="btn primary-button" onClick={handleClick}>
        {showInfo ? 'Piilota info' : 'Näytä info'}
      </button>
      {showInfo && (
        <div className="info-screen">
          <h3>Hello! Kokeile ohjelmaa siirtymällä <Link to="/login">login</Link> sivulle!</h3>
          <h4 className='text-warning'> käyttäjätunnus: smith <br></br>salasana: salasana</h4>
        </div>
      )}
    </div>
  );
};

export default HomePage;