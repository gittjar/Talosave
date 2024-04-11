import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [showInfo, setShowInfo] = useState(false);

  const handleClick = () => {
    setShowInfo(true);
  };

  return (
    <div>
      <div className="jumbotron">
        <h1 className="display-4">Hello!</h1>
        <p className="lead">Tämä on TaloSave. Verkkopohjainen tallennusohjelma sinun kiinteistöllesi. Kaikki oikeudet Jarno K. 2024.</p>
        <hr className="my-4" />
        <p>Testaa ohjelmaa ilmaiseksi!</p>
        <hr className="my-4" />

        <a className="btn btn-primary btn-lg" href="#" role="button" onClick={handleClick}>Katso lisätiedot!</a>
      </div>

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