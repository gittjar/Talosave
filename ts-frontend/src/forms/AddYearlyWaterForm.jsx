import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';
import FloatingLabel from 'react-bootstrap/FloatingLabel';  
import Form from 'react-bootstrap/Form';


const AddYearlyWaterForm = ({ propertyId, refreshData }) => {
    const [year, setYear] = useState('');
    const [m3, setM3] = useState('');
    const [euros, setEuros] = useState('');
    const [propertyid, setPropertyid] = useState(propertyId);    
    const [userid, setUserid] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
      
        const token = localStorage.getItem('userToken');
        const thisYear = new Date().getFullYear();

      
        // Validate the input values
        if (isNaN(year) || year < 2000) {
          toast.error('Year must be a number and after 2000');
          return;
        }

        if (isNaN(year) || year > thisYear) {
            toast.error('Year must be a number and before the current year');
            return;
        }
        
      
        if (isNaN(euros) || euros < 0 || euros > 10000) {
          toast.error('Euros must be a number and between 0 and 10000 per month');
          return;
        }
      
        try {
          const response = await axios({
            method: 'post',
            url: `${config.baseURL}/api/waterconsumptions/yearly`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            data: {
              propertyid,
              year,
              m3: parseFloat(m3),
              euros: parseFloat(euros),
              userid
            }
          });
      
          console.log(response.data);   
          refreshData();
          setYear('');
          setM3('');
          setEuros('');
          setSubmitted(true);
          toast.success('Vuosittainen vedenkulutus lisätty');
        } catch (error) {
          // Handle errors
          console.error('Error adding yearly water data:', error);
          toast.error('Error adding yearly water data');
        }
      };

    return (
<form onSubmit={handleSubmit}>
    <input type="number" value={propertyid} onChange={e => setPropertyid(e.target.value)} placeholder="Property ID" required hidden/>
    <FloatingLabel controlId="floatingYear" label="Year" className="mb-3">
        <Form.Control type="number" value={year} onChange={e => setYear(e.target.value)} required />
    </FloatingLabel>
    <FloatingLabel controlId="floatingM3" label="m3" className="mb-3">
        <Form.Control type="number" value={m3} onChange={e => setM3(e.target.value)} required />
    </FloatingLabel>
    <FloatingLabel controlId="floatingEuros" label="Euros" className="mb-3">
        <Form.Control type="number" value={euros} onChange={e => setEuros(e.target.value)} required />
    </FloatingLabel>
    <button type="submit" className='primary-button m-1'>Lisää</button>
</form>
    );
};

export default AddYearlyWaterForm;