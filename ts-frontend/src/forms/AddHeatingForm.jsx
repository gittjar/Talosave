import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';



const AddHeatingForm = ({ propertyId, refreshData, closeForm }) => {
    const [propertyid, setPropertyid] = useState(propertyId);    
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [kwh, setKwh] = useState('');
    const [mwh, setMwh] = useState('');
    const [m3, setM3] = useState('');
    const [liters, setLiters] = useState('');
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
        if (submitted && month === '' && year === '' && kwh === '' && mwh === '' && euros === '' && m3 === '' && liters === '') {
        closeForm();
        }
    }, [month, year, kwh, euros, mwh, m3, liters, submitted]);
    
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

            if (isNaN(mwh) || mwh < 0 || mwh > 100) {
                toast.error('MWh must be a number and between 0 and 100 per month');
                return;
            }
    
            if (isNaN(month) || month < 1 || month > 12) {
                toast.error('Month must be a number and between 1 and 12');
                return;
            }

            if (isNaN(m3) || m3 < 0 || m3 > 100) {
                toast.error('m3 must be a number and between 0 and 100 per month');
                return;
            }
            if (isNaN(liters) || liters < 0 || liters > 10000) {
                toast.error('Liters must be a number and between 0 and 10000 per month');
                return;
            }
    
            if (isNaN(euros) || euros < 0 || euros > 10000) {
                toast.error('Euros must be a number and between 0 and 10000 per month');
                return;
            }
                try {
                    const response = await axios({
                    method: 'post',
                    url: `${config.baseURL}/api/heatingconsumptions`,
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
                        mwh,
                        m3,
                        liters,
                        userid
                    }
                    });
                    if (response.status === 201) {
                    toast.success('Heating consumption added');
                    refreshData();
                    setSubmitted(true);
                    }
                } catch (error) {
                    if (error.response.status === 401) {
                    toast.error('You are not authorized to add heating consumption');
                    }
                    if (error.response && error.response.status === 400) {
                        toast.error('Tiedot tälle kuukaudelle on jo lisätty!');
                    } else {
                        toast.error('An error occurred while adding heating consumption');
                    }
                }
            
    }

    return (
        <div className='add-heating-form mb-4'>
            <h2>Lisää lämmityskulutus</h2>
            <form onSubmit={handleSubmit}>
  <div className="form-group">
    <input type="number" id="propertyid" className="form-control" value={propertyid} onChange={e => setPropertyid(e.target.value)} required hidden />
  </div>
  <div className="form-group">
    <label htmlFor="month">Month</label>
    <input type="text" id="month" className="form-control required" value={month} onChange={e => setMonth(e.target.value)} required/>
  </div>
  <div className="form-group">
    <label htmlFor="year">Year</label>
    <input type="text" id="year" className="form-control required" value={year} onChange={e => setYear(e.target.value)} required/>
  </div>
  <div className="form-group">
    <label htmlFor="kwh">kWh</label>
    <input type="text" id="kwh" className="form-control required" value={kwh} onChange={e => setKwh(e.target.value)} required/>
  </div>
  <div className="form-group">
    <label htmlFor="mwh">MWh</label>
    <input type="text" id="mwh" className="form-control required" value={mwh} onChange={e => setMwh(e.target.value)} required/>
  </div>
    <div className="form-group">
        <label htmlFor="m3">m3</label>
        <input type="text" id="m3" className="form-control required" value={m3} onChange={e => setM3(e.target.value)} required/>

    </div>
    <div className="form-group">
        <label htmlFor="liters">Liters</label>
        <input type="text" id="liters" className="form-control required" value={liters} onChange={e => setLiters(e.target.value)} required/>
    </div>
  <div className="form-group">
    <label htmlFor="euros">Euros</label>
    <input type="text" id="euros" className="form-control required" value={euros} onChange={e => setEuros(e.target.value)} required/>
  </div>
  <button type="submit" className="btn btn-primary mt-2">Add Heating Consumption</button>
</form>
        </div>
    );

}

export default AddHeatingForm;