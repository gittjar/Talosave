// hooks/PropertyProvider.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const PropertyContext = createContext();

export const useProperties = () => {
  return useContext(PropertyContext);
};
export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);

  const fetchProperties = async () => {
    const token = localStorage.getItem('userToken'); 
  
    try {
      const response = await axios.get('http://localhost:3000/api/properties', {
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

  useEffect(() => {
    fetchProperties();
  }, []);

  const value = {
    properties,
    fetchProperties
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};