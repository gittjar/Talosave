// EditUserForm.jsx
import { useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { Form, Button, Alert } from 'react-bootstrap';
import { Envelope, Telephone, CheckCircle } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const EditUserForm = ({ user, onUserUpdate, toggleEdit }) => {
    const [email, setEmail] = useState(user.email || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
    
        try {
            const response = await axios.put(`${config.baseURL}/api/put/${user.username}`, {
                email,
                phone,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
    
            if (response.status === 200) {
                onUserUpdate(response.data);
                toggleEdit();
                toast.success('Tiedot päivitetty onnistuneesti!', {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setError('Käyttäjää ei löydy');
            } else {
                setError('Virhe käyttäjän tietojen päivittämisessä. Yritä uudelleen.');
            }
            toast.error('Tietojen päivitys epäonnistui');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="edit-user-form">
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
                    {error}
                </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center fw-medium">
                        <Envelope size={16} className="text-primary me-2" />
                        Sähköposti
                    </Form.Label>
                    <Form.Control 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        placeholder="esimerkki@email.com"
                        required
                        className="shadow-sm"
                    />
                    <Form.Text className="text-muted">
                        Syötä voimassa oleva sähköpostiosoite
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center fw-medium">
                        <Telephone size={16} className="text-primary me-2" />
                        Puhelinnumero
                    </Form.Label>
                    <Form.Control 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+358 40 123 4567"
                        className="shadow-sm"
                    />
                    <Form.Text className="text-muted">
                        Valinnainen yhteystietoihin
                    </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                        className="fw-semibold py-2"
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Tallennetaan...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} className="me-2" />
                                Tallenna muutokset
                            </>
                        )}
                    </Button>
                    <Button 
                        variant="outline-secondary" 
                        onClick={toggleEdit}
                        disabled={loading}
                        className="fw-semibold"
                    >
                        Peruuta
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default EditUserForm;