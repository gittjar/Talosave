// hooks/useUser.js
import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi.js';

export const useUser = (username = null) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { loading, error, get, clearError } = useApi();

  const getCurrentUsername = () => {
    return username || localStorage.getItem('username');
  };

  const fetchUser = useCallback(async () => {
    const currentUsername = getCurrentUsername();
    
    if (!currentUsername) {
      throw new Error('Käyttäjätunnus ei löytynyt. Kirjaudu uudelleen sisään.');
    }

    try {
      const userData = await get(`/api/users/${currentUsername}`);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error('Käyttäjätietojen lataaminen epäonnistui.');
    }
  }, [username, get]);

  const updateUser = useCallback(async (updatedUserData) => {
    const currentUsername = getCurrentUsername();
    
    if (!currentUsername) {
      throw new Error('Käyttäjätunnus ei löytynyt');
    }

    try {
      // Refresh user data after update
      await fetchUser();
      setIsEditing(false);
    } catch (error) {
      throw new Error('Käyttäjätietojen päivittäminen epäonnistui.');
    }
  }, [fetchUser]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    clearError();
  };

  useEffect(() => {
    if (getCurrentUsername()) {
      fetchUser().catch(console.error);
    }
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    isEditing,
    fetchUser,
    updateUser,
    toggleEdit,
    clearError
  };
};