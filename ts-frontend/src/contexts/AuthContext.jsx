import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
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
          console.log('Token expired, logging out');
          logout();
        } else {
          console.log('Setting user as logged in with username:', username);
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
    console.log('Login called with username:', username);
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', username);
    setIsLoggedIn(true);
    setUser({ username });
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider 
      value={{
        isLoggedIn,
        user,
        loading,
        login,
        logout,
        checkAuthStatus,
        getAuthHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
