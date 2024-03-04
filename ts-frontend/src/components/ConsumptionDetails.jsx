import React from 'react';
import { Link, useParams } from 'react-router-dom';

const ConsumptionDetails = () => {
  const { id } = useParams();

  
  return (
    <div>
    <ul className="nav nav-tabs">
        <li className="nav-item">
            <Link className="nav-link" to="/mypage">Minun kohteet</Link>
        </li>
        <li className="nav-item">
            <Link className="nav-link" to={`/properties/${id}`}>Kohdetiedot ja remontit</Link>
        </li>
        <li className="nav-item">
            <a className="nav-link active" href="#">Aktiivinen</a>
        </li>
        <li className="nav-item">
            <Link className="nav-link" to={`/electricity/${id}`}>Sähkön kulutus</Link>
        </li>
        <li className="nav-item">
            <a className="nav-link disabled" aria-disabled="true">Disabled</a>
        </li>
    </ul>
  </div>
  );
};

export default ConsumptionDetails;