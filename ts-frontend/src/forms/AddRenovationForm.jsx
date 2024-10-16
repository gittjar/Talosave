// Import useEffect and useState hooks from React
import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a custom toast
const BigToast = ({ closeToast, message }) => (
  <div className="big-toast">
    <h1>Error!</h1>
    <p className="toast-message">{message}</p>
    <button onClick={closeToast}>Close</button>
  </div>
)

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

    const dateObj = new Date(date);


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
          date : dateObj,
          cost,
          userid
         
        })
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get the error message from the response
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Show the Toast
      console.log('Show the Toast');
      toast.success('Uusi remontti lisätty onnistuneesti!');

      refreshData();
      closeForm();

  


      // Clear the form fields
      // setPropertyid('');
      setConstructionCompany('');
      setRenovation('');
      setDate('');
      setCost('');


    } catch (error) {
      console.error('Error:', error);
      toast.error(<BigToast message={error.message} />); // Display the custom toast

    }
  };

  // Define your form
  return (
    <>
<form onSubmit={handleSubmit}>
<div>

<div>
    <label htmlFor="propertyid">Kiinteistö ID: </label>
    <span id="propertyid"> {propertyid}</span>
  </div>
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

  <button type="submit" className='primary-button mb-3'>Tallenna</button>
  <button type="button" className='secondary-button' onClick={closeForm}>Peruuta</button>
</form>


 </>
  );
};

export default AddRenovationForm;