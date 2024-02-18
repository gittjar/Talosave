import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../configuration/config';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await axios.post(`${config.baseURL}/api/login`, {
        username,
        password,
      });
  
      if (response.status === 404) {
        setError('User not found');
      } else {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userId', response.data.id);
  
        navigate('/mypage');
      }
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <button className="primary-button" type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;