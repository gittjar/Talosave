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
    console.log('Checking auth status...');
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    
    console.log('Auth tokens:', { token: !!token, username });
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        console.log('Token info:', { exp: decodedToken.exp, current: currentTime, valid: decodedToken.exp > currentTime });
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          console.log('Token expired, logging out');
          logout();
        } else {
          console.log('Setting user as logged in');
          setIsLoggedIn(true);
          setUser({ username });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      console.log('No token found, user not logged in');
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