import { useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { ProgressBar, Alert } from 'react-bootstrap';
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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score++;
    else feedback.push('vähintään 8 merkkiä');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('pieni kirjain');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('iso kirjain');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('numero');

    const strengthLevels = {
      0: { text: 'Ei salasanaa', color: 'secondary' },
      1: { text: 'Erittäin heikko', color: 'danger' },
      2: { text: 'Heikko', color: 'warning' },
      3: { text: 'Kohtalainen', color: 'info' },
      4: { text: 'Vahva', color: 'success' }
    };

    return {
      score,
      text: strengthLevels[score].text,
      color: strengthLevels[score].color,
      feedback: feedback.length > 0 ? `Puuttuu: ${feedback.join(', ')}` : 'Salasana täyttää vaatimukset'
    };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Salasanat eivät täsmää');
      return;
    }

    if (passwordStrength.score < 4) {
      toast.error('Salasana ei täytä vaatimuksia. ' + passwordStrength.feedback);
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
      const errorMessage = error.response?.data?.error || error.response?.data || 'User already exists';
      toast.error(errorMessage);
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
        <Form.Control 
          type="password" 
          value={password} 
          onChange={handlePasswordChange} 
          required 
        />
        <div className="invalid-feedback">Salasana vaaditaan</div>
      </FloatingLabel>
      
      {password && (
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Salasanan vahvuus:</small>
            <small className={`text-${passwordStrength.color}`}>
              <strong>{passwordStrength.text}</strong>
            </small>
          </div>
          <ProgressBar 
            now={(passwordStrength.score / 4) * 100} 
            variant={passwordStrength.color}
            style={{ height: '8px' }}
          />
          <small className="text-muted d-block mt-1">{passwordStrength.feedback}</small>
        </div>
      )}

      <Alert variant="info" className="mb-3 py-2">
        <small>
          <strong>Salasanavaatimukset:</strong><br />
          • Vähintään 8 merkkiä<br />
          • Vähintään 1 iso kirjain (A-Z)<br />
          • Vähintään 1 pieni kirjain (a-z)<br />
          • Vähintään 1 numero (0-9)
        </small>
      </Alert>
      
      <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password" className="mb-2">
        <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <div className="invalid-feedback">Vahvista salasana</div>
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