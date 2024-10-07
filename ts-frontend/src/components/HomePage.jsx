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
    setShowInfo(true);
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
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 img-fluid"
            src="../assets/images/IMG_2728.WEBP"
            alt="Second slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 img-fluid"
            src="../assets/images/IMG_2729.WEBP"
            alt="Third slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 img-fluid"
            src="../assets/images/IMG_2730.WEBP"
            alt="Fourth slide"
          />
        </Carousel.Item>
      </Carousel>

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