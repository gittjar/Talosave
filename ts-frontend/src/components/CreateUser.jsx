import { useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const CreateUser = () => {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

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
        toast.success('Käyttäjä luotu onnistuneesti!');
        navigate('/login'); // Redirect to login page

      } else {
       toast.error('Error executing query');
      }
    } catch (error) {
      toast.error('User already exists');
    }
  };


  return (
    <section className='create-user-form'>
 
    <Form onSubmit={handleSubmit} className="was-validated">
  
        <FloatingLabel controlId="floatingUsername" label="Username" className="mb-2 mt-2">
        <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        <div className="invalid-feedback">Please fill out this field.</div>
      </FloatingLabel>
      <FloatingLabel controlId="floatingFullname" label="Fullname" className="mb-2">
        <Form.Control type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
        <div className="invalid-feedback">Please fill out this field.</div>
      </FloatingLabel>
      <FloatingLabel controlId="floatingPassword" label="Password" className="mb-2">
        <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <div className="invalid-feedback">Please fill out this field. Atleast 6 character.</div>
      </FloatingLabel>
      <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password" className="mb-2">
        <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <div className="invalid-feedback">Please fill out this field. Atleast 6 character.</div>
      </FloatingLabel>
      <FloatingLabel controlId="floatingEmail" label="Email" className="mb-2">
        <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </FloatingLabel>
      <FloatingLabel controlId="floatingPhone" label="Phone" className="mb-2">
        <Form.Control type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </FloatingLabel>
      <button className='primary-button' type="submit">Create User</button>
    </Form >
    </section>
  );
};

export default CreateUser;