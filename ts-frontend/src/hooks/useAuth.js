// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          logout();
        } else {
          setIsLoggedIn(true);
          setUser({ username });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = (token, username) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', username);
    setIsLoggedIn(true);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    getAuthHeaders
  };
};