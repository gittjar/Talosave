// hooks/useApi.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const request = useCallback(async (method, endpoint, data = null, customHeaders = {}) => {
    setLoading(true);
    setError(null);

    try {
      const config_obj = {
        method,
        url: `${config.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          ...customHeaders
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config_obj.data = data;
      }

      const response = await axios(config_obj);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Pyyntö epäonnistui';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((endpoint, headers = {}) => 
    request('GET', endpoint, null, headers), [request]);
  
  const post = useCallback((endpoint, data, headers = {}) => 
    request('POST', endpoint, data, headers), [request]);
  
  const put = useCallback((endpoint, data, headers = {}) => 
    request('PUT', endpoint, data, headers), [request]);
  
  const del = useCallback((endpoint, headers = {}) => 
    request('DELETE', endpoint, null, headers), [request]);

  const clearError = () => setError(null);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    clearError
  };
};