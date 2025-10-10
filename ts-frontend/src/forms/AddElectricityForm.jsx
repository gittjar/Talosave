import React from 'react';
import { toast } from 'react-toastify';
import { useConsumption } from '../hooks/useConsumption.js';
import { useForm } from '../hooks/useForm.js';

const AddElectricityForm = ({ propertyId, refreshData, closeForm }) => {
  const { addConsumption, loading } = useConsumption('electricity');
  
  const { values, handleChange, handleSubmit, reset } = useForm(
    {
      propertyid: propertyId,
      month: '',
      year: '',
      kwh: '',
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

      if (isNaN(formData.euros) || formData.euros < 0 || formData.euros > 10000) {
        toast.error('Euros must be a number between 0 and 10,000');
        throw new Error('Invalid euros');
      }

      try {
        await addConsumption(formData);
        toast.success('Sähkönkulutus lisätty onnistuneesti!');
        
        if (refreshData) {
          await refreshData();
        }
        
        reset();
        if (closeForm) {
          closeForm();
        }
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.includes('tallennettu')) {
          toast.error('Tieto tälle kuukaudelle ja vuodelle on jo tallennettu.');
        } else {
          toast.error('Virhe lisättäessä sähkönkulutusta');
        }
        throw error;
      }
    }
  );

  return (
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
      
      <input 
        className='m-1 w-25' 
        type="number" 
        name="month"
        value={values.month} 
        onChange={handleChange} 
        placeholder="Month" 
        required 
      />
      <br />
      
      <input 
        className='m-1 w-25' 
        type="number" 
        name="year"
        value={values.year} 
        onChange={handleChange} 
        placeholder="Year" 
        required 
      />
      <br />
      
      <input 
        className='m-1 w-25' 
        type="number" 
        name="kwh"
        value={values.kwh} 
        onChange={handleChange} 
        placeholder="Kwh" 
        required 
      />
      <br />
      
      <input 
        className='m-1 w-25' 
        type="number" 
        name="euros"
        value={values.euros} 
        onChange={handleChange} 
        placeholder="Euros" 
        required 
      />
      <br />
      
      <button 
        type="submit" 
        className='primary-button m-1' 
        disabled={loading}
      >
        {loading ? 'Lisätään...' : 'Lisää'}
      </button>
    </form>
  );
};

export default AddElectricityForm;