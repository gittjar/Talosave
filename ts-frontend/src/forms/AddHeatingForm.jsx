import React from 'react';
import { toast } from 'react-toastify';
import { useConsumption } from '../hooks/useConsumption.js';
import { useForm } from '../hooks/useForm.js';

const AddHeatingForm = ({ propertyId, refreshData, closeForm }) => {
  const { addConsumption, loading } = useConsumption('heating');
  
  const { values, handleChange, handleSubmit, reset } = useForm(
    {
      propertyid: propertyId,
      month: '',
      year: '',
      kwh: '',
      mwh: '',
      m3: '',
      liters: '',
      euros: '',
      userid: localStorage.getItem('userId') || ''
    },
    async (formData) => {
      // Validation
      if (isNaN(formData.year) || formData.year < 2000) {
        toast.error('Year must be a number and after 2000');
        throw new Error('Invalid year');
      }

      if (isNaN(formData.month) || formData.month < 1 || formData.month > 12) {
        toast.error('Month must be a number between 1 and 12');
        throw new Error('Invalid month');
      }

      if (isNaN(formData.kwh) || formData.kwh < 0 || formData.kwh > 50000) {
        toast.error('kWh must be a number between 0 and 50,000');
        throw new Error('Invalid kWh');
      }

      if (isNaN(formData.mwh) || formData.mwh < 0 || formData.mwh > 100) {
        toast.error('MWh must be a number between 0 and 100');
        throw new Error('Invalid mWh');
      }

      if (isNaN(formData.m3) || formData.m3 < 0 || formData.m3 > 100) {
        toast.error('m3 must be a number between 0 and 100');
        throw new Error('Invalid m3');
      }

      if (isNaN(formData.liters) || formData.liters < 0 || formData.liters > 10000) {
        toast.error('Liters must be a number between 0 and 10,000');
        throw new Error('Invalid liters');
      }

      if (isNaN(formData.euros) || formData.euros < 0 || formData.euros > 10000) {
        toast.error('Euros must be a number between 0 and 10,000');
        throw new Error('Invalid euros');
      }

      try {
        await addConsumption(formData);
        toast.success('Heating consumption added');
        
        if (refreshData) {
          await refreshData();
        }
        
        reset();
        if (closeForm) {
          closeForm();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          toast.error('Tiedot tälle kuukaudelle on jo lisätty!');
        } else if (error.response?.status === 401) {
          toast.error('You are not authorized to add heating consumption');
        } else {
          toast.error('An error occurred while adding heating consumption');
        }
        throw error;
      }
    }
  );

  return (
    <div className='add-heating-form mb-4'>
      <h2>Lisää lämmityskulutus</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="hidden" 
          name="propertyid" 
          value={values.propertyid} 
        />
        <input 
          type="hidden" 
          name="userid" 
          value={values.userid} 
        />

        <div className="form-group">
          <label htmlFor="month">Month</label>
          <input 
            type="number" 
            id="month" 
            name="month"
            className="form-control required" 
            value={values.month} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input 
            type="number" 
            id="year" 
            name="year"
            className="form-control required" 
            value={values.year} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="kwh">kWh</label>
          <input 
            type="number" 
            id="kwh" 
            name="kwh"
            className="form-control required" 
            value={values.kwh} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="mwh">MWh</label>
          <input 
            type="number" 
            id="mwh" 
            name="mwh"
            className="form-control required" 
            value={values.mwh} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="m3">m3</label>
          <input 
            type="number" 
            id="m3" 
            name="m3"
            className="form-control required" 
            value={values.m3} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="liters">Liters</label>
          <input 
            type="number" 
            id="liters" 
            name="liters"
            className="form-control required" 
            value={values.liters} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="euros">Euros</label>
          <input 
            type="number" 
            id="euros" 
            name="euros"
            className="form-control required" 
            value={values.euros} 
            onChange={handleChange} 
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary mt-2"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Heating Consumption'}
        </button>
      </form>
    </div>
  );
};

export default AddHeatingForm;