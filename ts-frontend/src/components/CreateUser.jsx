import React, { useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';

const CreateUser = () => {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${config.baseURL}/api/create`, {
        username,
        fullname,
        password,
        email,
        phone,
        role: 'user'
      });

      if (response.status === 201) {
        alert('User added');
      } else {
        alert('Error executing query');
      }
    } catch (error) {
      alert('User already exists');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FloatingLabel controlId="floatingUsername" label="Username" className="mb-2">
        <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required />
      </FloatingLabel>
      <FloatingLabel controlId="floatingFullname" label="Fullname" className="mb-2">
        <Form.Control type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
      </FloatingLabel>
      <FloatingLabel controlId="floatingPassword" label="Password" className="mb-2">
        <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </FloatingLabel>
      <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password" className="mb-2">
        <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      </FloatingLabel>
      <FloatingLabel controlId="floatingEmail" label="Email" className="mb-2">
        <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </FloatingLabel>
      <FloatingLabel controlId="floatingPhone" label="Phone" className="mb-2">
        <Form.Control type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </FloatingLabel>
      <button className='primary-button' type="submit">Create User</button>
    </Form>
  );
};

export default CreateUser;