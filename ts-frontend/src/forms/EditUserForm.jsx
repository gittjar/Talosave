// EditUserForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../configuration/config';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

const EditUserForm = ({ user, onUserUpdate, toggleEdit }) => {
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const response = await axios.put(`${config.baseURL}/api/put/${user.username}`, {
                email,
                phone,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
    
            if (response.status === 200) { // Check if the status is 200 (OK)
                onUserUpdate(response.data); // Call the callback function with the updated user data
                toggleEdit(); // Close the edit form
                toast.success('Tiedot päivitetty onnistuneesti');
            } else if (response.status === 404) {
                setError('User not found');
            }
        } catch (error) {
            setError('Virhe käyttäjän tietojen päivittämisessä');
        }
    };
    
    return (
        <div>
            <h4>Muokkaa käyttäjätietoja</h4>
            <section className='login-form'>
                <Form onSubmit={handleSubmit}>
                    {error && <p>{error}</p>}
                    <FloatingLabel controlId="floatingEmail" label="Email" className="mb-2 mt-2">
                        <Form.Control type="text" value={email} onChange={e => setEmail(e.target.value)} />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingPhone" label="Phone" className="mb-2 mt-2">
                        <Form.Control type="text" value={phone} onChange={e => setPhone(e.target.value)} />
                    </FloatingLabel>
                    <button className="primary-button" type="submit">Update</button>
                </Form>
            </section>
        </div>
    );
}

export default EditUserForm;