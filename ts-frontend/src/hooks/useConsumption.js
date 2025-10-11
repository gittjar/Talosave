// hooks/useConsumption.js
import { useState, useCallback } from 'react';
import { useApi } from './useApi.js';

export const useConsumption = (consumptionType) => {
  const [consumptions, setConsumptions] = useState([]);
  const { loading, error, get, post, delete: del, clearError } = useApi();

  const getEndpoint = () => {
    const endpoints = {
      electricity: '/api/electricconsumptions',
      heating: '/api/heatingconsumptions',
      water: '/api/waterconsumptions'
    };
    return endpoints[consumptionType] || '/api/consumptions';
  };

  const fetchConsumptions = useCallback(async (propertyId = null) => {
    try {
      const endpoint = propertyId 
        ? `${getEndpoint()}/${propertyId}` 
        : getEndpoint();
      
      const data = await get(endpoint);
      setConsumptions(data);
      return data;
    } catch (error) {
      throw new Error(`${consumptionType} kulutustietojen lataaminen epäonnistui.`);
    }
  }, [consumptionType, get]);

  const addConsumption = useCallback(async (consumptionData) => {
    try {
      const result = await post(getEndpoint(), consumptionData);
      // Use propertyid (lowercase) from the data, fallback to propertyId (camelCase)
      const propertyId = consumptionData.propertyid || consumptionData.propertyId;
      if (propertyId) {
        await fetchConsumptions(propertyId);
      }
      return result;
    } catch (error) {
      // Pass through the original error for specific error handling
      throw error;
    }
  }, [consumptionType, post, fetchConsumptions]);

  const deleteConsumption = useCallback(async (consumptionId) => {
    try {
      await del(`${getEndpoint()}/${consumptionId}`);
      setConsumptions(prev => prev.filter(item => item.id !== consumptionId));
    } catch (error) {
      throw new Error(`${consumptionType} kulutustiedon poistaminen epäonnistui.`);
    }
  }, [consumptionType, del]);

  const getConsumptionsByProperty = useCallback((propertyId) => {
    return consumptions.filter(consumption => 
      consumption.propertyid === propertyId || consumption.propertyId === propertyId
    );
  }, [consumptions]);

  const getConsumptionsByYear = useCallback((year) => {
    return consumptions.filter(consumption => 
      new Date(consumption.date || consumption.createdAt).getFullYear() === year
    );
  }, [consumptions]);

  return {
    consumptions,
    loading,
    error,
    fetchConsumptions,
    addConsumption,
    deleteConsumption,
    getConsumptionsByProperty,
    getConsumptionsByYear,
    clearError
  };
};