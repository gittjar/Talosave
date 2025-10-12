// hooks/PropertyProvider.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useApi } from './useApi.js';

const PropertyContext = createContext();

export const useProperties = () => {
  return useContext(PropertyContext);
};

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, error } = useApi();
  const fetchProperties = async () => {
    setLoading(true);
    try {
      console.log('Fetching properties...');
      const response = await get('/api/get');
      console.log('Properties response:', response);
      setProperties(response || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      if (error.response?.status === 401) {
        console.log('401 error - user not authenticated');
        // Clear auth data and redirect to login
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const value = {
    properties,
    loading,
    fetchProperties,
    error
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};