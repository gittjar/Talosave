// hooks/ElectricityConsumptionProvider.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config';

const ElectricityConsumptionContext = createContext();

export const useElectricityConsumptions = () => {
  return useContext(ElectricityConsumptionContext);
};

export const ElectricityConsumptionProvider = ({ children }) => {
  const [electricityConsumptions, setElectricityConsumptions] = useState([]);

  const fetchElectricityConsumptions = async () => {
    const token = localStorage.getItem('userToken'); 

    try {
      const response = await axios.get(`${config.baseURL}/api/electricconsumptions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setElectricityConsumptions(response.data);
    } catch (error) {
      console.error('Error fetching electricity consumptions:', error);
      // Handle error as needed
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElectricityConsumptions().then(() => setLoading(false));
  }, []);
  
  const value = {
    electricityConsumptions,
    loading,
    fetchElectricityConsumptions
  };

  return (
    <ElectricityConsumptionContext.Provider value={value}>
      {children}
    </ElectricityConsumptionContext.Provider>
  );
};