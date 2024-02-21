// Import useEffect and useState hooks from React
import { useState, useEffect } from 'react';
import config from '../configuration/config.js';


// Define your AddRenovationForm component
const AddRenovationForm = ({ propertyId }) => {
  // Define state variables for your form fields
  const [propertyid, setPropertyid] = useState(propertyId);
  const [construction_company, setConstructionCompany] = useState('');
  const [renovation, setRenovation] = useState('');
  const [date, setDate] = useState('');
  const [userid, setUserid] = useState(null);


  // Define your form submission handler
  // When the component mounts, get the userid from local storage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
        setUserid(storedUserId);
    }
  }, []);

  // Define your form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('userToken');

    try {
      // Make a POST request to the /renovations endpoint
      const response = await fetch(`${config.baseURL}/api/renovations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyid,
          construction_company,
          renovation,
          date
         
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear the form fields
      setPropertyid('');
      setConstructionCompany('');
      setRenovation('');
      setDate('');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Define your form
  return (
<form onSubmit={handleSubmit}>
  <div>
    <label htmlFor="propertyid">Property ID:</label>
    <input
      type="number"
      id="propertyid"
      value={propertyid}
      onChange={e => setPropertyid(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="construction_company">Construction Company:</label>
    <input
      type="text"
      id="construction_company"
      value={construction_company}
      onChange={e => setConstructionCompany(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="renovation">Renovation:</label>
    <input
      type="text"
      id="renovation"
      value={renovation}
      onChange={e => setRenovation(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="date">Date:</label>
    <input
      type="date"
      id="date"
      value={date}
      onChange={e => setDate(e.target.value)}
    />
  </div>

  <button type="submit">Submit</button>
</form>
  );
};

export default AddRenovationForm;