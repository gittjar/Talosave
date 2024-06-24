import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';

const AddElectricityForm = ({ propertyId, refreshData, closeForm }) => {
  const [propertyid, setPropertyid] = useState(propertyId);    
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [kwh, setKwh] = useState('');
  const [euros, setEuros] = useState('');
  const [userid, setUserid] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserid(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (submitted && month === '' && year === '' && kwh === '' && euros === '') {
      closeForm();
    }
  }, [month, year, kwh, euros, submitted]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('userToken');

      // Validate the input values
    
        if (isNaN(year) || year < 2000) {
            toast.error('Year must be a number and after 2000');
            return;
        }

        if (isNaN(kwh) || kwh < 0 || kwh > 50000) {
            toast.error('kWh must be a number and between 0 and 50000 per month');
            return;
        }

        if (isNaN(month) || month < 1 || month > 12) {
            toast.error('Month must be a number and between 1 and 12');
            return;
        }

        if (isNaN(euros) || euros < 0 || euros > 10000) {
            toast.error('Euros must be a number and between 0 and 10000 per month');
            return;
        }
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
                setMonth('');
                setYear('');
                setKwh('');
                setEuros('');
                setSubmitted(true);
                toast.success('Sähkötiedot lisätty onnistuneesti!');
                    } catch (error) {
                        if (error.response && error.response.status === 400 && error.response.data === 'Tieto tälle kuukaudelle ja vuodelle on jo tallennettu.') {
                        toast.error('Tieto tälle kuukaudelle ja vuodelle on jo tallennettu.');
                    } else {
                        toast.error('An error occurred while adding the electricity data.');
                    }
                    }
                };


  return (
    <form onSubmit={handleSubmit}>
       
      <span type="number" value={propertyid} onChange={e => setPropertyid(e.target.value)} placeholder="Property ID" required />
      <br></br>
      <input className='m-1 w-25' type="number" value={month} onChange={e => setMonth(e.target.value)} placeholder="Month" required />
      <br></br>
      <input className='m-1 w-25' type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Year" required />
      <br></br>
      <input className='m-1 w-25' type="number" value={kwh} onChange={e => setKwh(e.target.value)} placeholder="Kwh" required />
      <br></br>
      <input className='m-1 w-25' type="number" value={euros} onChange={e => setEuros(e.target.value)} placeholder="Euros" required />
      <br></br>
      <button type="submit" className='primary-button m-1'>Lisää</button>
       
    </form>
  );
};

export default AddElectricityForm;







 



