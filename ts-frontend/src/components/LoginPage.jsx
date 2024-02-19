import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../configuration/config';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';

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
      <section className='login-form'>
      <Form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        <FloatingLabel controlId="floatingUsername" label="Username" className="mb-2 mt-2">
          <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </FloatingLabel>
        <FloatingLabel controlId="floatingPassword" label="Password" className='mb-2'>
          <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </FloatingLabel>
        <button className="primary-button" type="submit">Login</button>
      </Form>
      </section>
    </div>
  );
};

export default LoginPage;