// Import useEffect and useState hooks from React
import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';

// Define your AddRenovationForm component
const AddRenovationForm = ({ propertyId, refreshData, closeForm }) => {
  // Define state variables for your form fields
  const [propertyid, setPropertyid] = useState(propertyId);
  const [construction_company, setConstructionCompany] = useState('');
  const [renovation, setRenovation] = useState('');
  const [date, setDate] = useState('');
  const [userid, setUserid] = useState(null);
  const [cost, setCost] = useState('');

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
          date,
          cost
         
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      refreshData();
      closeForm();

       // Show the Toast
       console.log('Show the Toast');
       toast.success('Uusi remontti lisätty onnistuneesti!');


      // Clear the form fields
      setPropertyid('');
      setConstructionCompany('');
      setRenovation('');
      setDate('');
      setCost('');


    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Define your form
  return (
    <>
<form onSubmit={handleSubmit}>
<div>
    <label htmlFor="propertyid">Kiinteistö ID: </label>
    <span id="propertyid"> {propertyid}</span>
  </div>

  <div>
    <label htmlFor="construction_company">Remontin tekijä</label>
    <input
      type="text"
      id="construction_company"
      value={construction_company}
      onChange={e => setConstructionCompany(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="renovation">Remontti</label>
    <input
      type="text"
      id="renovation"
      value={renovation}
      onChange={e => setRenovation(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="date">Päivämäärä</label>
    <input
      type="date"
      id="date"
      value={date}
      onChange={e => setDate(e.target.value)}
    />
  </div>
  <div>
    <label htmlFor="cost">Remontin arvo (€)</label>
    <input
      type="number"
      id="cost"
      value={cost}
      onChange={e => setCost(e.target.value)}
    />
  </div>

  <button type="submit" className='primary-button'>Tallenna</button>
</form>


 </>
  );
};

export default AddRenovationForm;