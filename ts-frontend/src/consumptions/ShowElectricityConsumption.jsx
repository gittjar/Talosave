import React from 'react';
import { useElectricityConsumptions } from '../hooks/ElectricityConsumptionProvider';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ShowElectricityConsumption = () => {
    const { id } = useParams(); // Get the property ID from the URL
    const { electricityConsumptions, loading } = useElectricityConsumptions();
  
    // Filter the electricityConsumptions array to only include the records for the current property
    const currentPropertyConsumptions = electricityConsumptions.filter(consumption => consumption.propertyid === Number(id));
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    return (

      <div>
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
      <h1>Electricity Consumption Details</h1>


        {currentPropertyConsumptions.map((consumption, index) => (
          <div key={index}>
            <p>Property Name: {consumption.propertyname}</p>
            <p>Property ID: {consumption.propertyid}</p>
            <p>Month: {consumption.month}</p>
            <p>Year: {consumption.year}</p>
            <p>kWh: {consumption.kwh}</p>
            <p>Euros: {consumption.euros}</p>
          </div>
        ))}
      </div>
  );
};

export default ShowElectricityConsumption;