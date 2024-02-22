import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import RenovationDetails from './RenovationDetails';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

const PropertyRenovations = ({ propertyId }) => {
  const [renovations, setRenovations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('userToken'); // Assuming you store your token in localStorage

    fetch(`${config.baseURL}/api/renovations/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setRenovations(data))
      .catch(error => console.error('Error:', error));
  }, [propertyId]);

  return (
    <div>
      
      {renovations.length > 0 ? (
  <Card className="card">
    <Card.Header className="card-header">
      <h4>Remontit ja muutostyöt</h4>
    </Card.Header>
    <ListGroup variant="flush">
      {renovations.map((renovation, index) => (
        <ListGroup.Item key={index} className="list-group-item">
          <h5>
            {renovation.construction_company} | {renovation.renovation} on {renovation.date}
          </h5>
          <div className='thinline2'></div>
          <RenovationDetails renovationId={renovation.id} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Card>
) : (
  <p>No renovations found for this property.</p>
)}
    </div>
  );
};

export default PropertyRenovations;