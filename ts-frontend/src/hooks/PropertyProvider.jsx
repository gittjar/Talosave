// hooks/PropertyProvider.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config';

const PropertyContext = createContext();

export const useProperties = () => {
  return useContext(PropertyContext);
};
export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);

  const fetchProperties = async () => {
    const token = localStorage.getItem('userToken'); 
  
    try {
      const response = await axios.get(`${config.baseURL}/api/get`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Handle error as needed
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties().then(() => setLoading(false));
  }, []);
  
  const value = {
    properties,
    loading,
    fetchProperties
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};