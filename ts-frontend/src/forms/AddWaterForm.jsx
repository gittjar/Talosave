import React from 'react';
import { toast } from 'react-toastify';
import { useConsumption } from '../hooks/useConsumption.js';
import { useForm } from '../hooks/useForm.js';

const AddWaterForm = ({ propertyId, refreshData, closeForm }) => {
  const { addConsumption, loading } = useConsumption('water');
  
  const { values, handleChange, handleSubmit, reset } = useForm(
    {
      propertyid: propertyId,
      month: '',
      year: '',
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

      if (isNaN(formData.liters) || formData.liters < 0 || formData.liters > 50000) {
        toast.error('Liters must be a number between 0 and 50,000');
        throw new Error('Invalid liters');
      }

      if (isNaN(formData.euros) || formData.euros < 0 || formData.euros > 10000) {
        toast.error('Euros must be a number between 0 and 10,000');
        throw new Error('Invalid euros');
      }

      try {
        await addConsumption(formData);
        toast.success('Veden kulutustiedot lisätty onnistuneesti!');
        
        if (refreshData) {
          await refreshData();
        }
        
        reset();
        if (closeForm) {
          closeForm();
        }
      } catch (error) {
        console.error('Error adding water data:', error);
        toast.error('Error adding water data');
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
        name="liters"
        value={values.liters} 
        onChange={handleChange} 
        placeholder="Liters" 
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
        className='btn btn-info text-white m-1' 
        disabled={loading}
      >
        {loading ? 'Lisätään...' : 'Lisää'}
      </button>
    </form>
  );
};

export default AddWaterForm;