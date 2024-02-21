import { useState, useEffect } from 'react';
import config from '../configuration/config.js';

const RenovationDetails = ({ renovationId }) => {
  const [renovationDetails, setRenovationDetails] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('userToken'); // Assuming you store your token in localStorage

    fetch(`${config.baseURL}/api/renovationdetails/${renovationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setRenovationDetails(data))
      .catch(error => console.error('Error:', error));
  }, [renovationId]);

  return (
<div>
  <p>Renovation Details</p>
  
  {renovationDetails.length > 0 ? (
    <ul>
      {renovationDetails.map((detail, index) => (
        <li key={index}>
          {detail.detail}
        </li>
      ))}
    </ul>
  ) : (
    <p>No details found for this renovation.</p>
  )}
</div>
  );
};

export default RenovationDetails;