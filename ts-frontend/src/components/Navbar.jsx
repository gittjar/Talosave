import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);
  }, [location]); // Re-render when the location changes

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
  };

  return (
    <nav>
      <ul>
        <li><Link to="/home">Home</Link></li>
        {isLoggedIn ? (
          <><li><Link to="/login" onClick={handleLogout}>Logout</Link></li><li><Link to="/mypage">My Page</Link></li></>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;