// hooks/PropertyProvider.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useApi } from './useApi.js';
import { useAuth } from './useAuth.js';

const PropertyContext = createContext();

export const useProperties = () => {
  return useContext(PropertyContext);
};

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, error } = useApi();
  const { isLoggedIn } = useAuth();

  const fetchProperties = async () => {
    if (!isLoggedIn) {
      console.warn('User not authenticated, skipping property fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching properties...');
      const response = await get('/api/get');
      console.log('Properties response:', response);
      setProperties(response || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [isLoggedIn]);

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