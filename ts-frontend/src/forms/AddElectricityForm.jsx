import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';

const AddElectricityForm = ({ propertyId, refreshData, closeForm }) => {
const [propertyid, setPropertyid] = useState(propertyId);    
const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [kwh, setKwh] = useState('');
  const [euros, setEuros] = useState('');
  const [userid, setUserid] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserid(storedUserId);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('userToken');

    try {
      const response = await axios({
        method: 'post',
        url: `${config.baseURL}/api/electricconsumptions`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          propertyid,
          month,
          year,
          kwh,
          euros,
          userid
        }
      });

      console.log(response.data);
      refreshData();
      closeForm();
    } catch (error) {
      console.error('Error adding electricity data:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <span type="number" value={propertyid} onChange={e => setPropertyid(e.target.value)} placeholder="Property ID" required />
      <input className='mb-2' type="number" value={month} onChange={e => setMonth(e.target.value)} placeholder="Month" required />
      <input className='mb-2' type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Year" required />
      <input className='mb-2' type="number" value={kwh} onChange={e => setKwh(e.target.value)} placeholder="Kwh" required />
      <input className='mb-2' type="number" value={euros} onChange={e => setEuros(e.target.value)} placeholder="Euros" required />
      <button type="submit" className='primary-button mt-1'>Add Electricity Data</button>
      <button type="button" className='secondary-button' onClick={closeForm}>Cancel</button>
    </form>
  );
};

export default AddElectricityForm;