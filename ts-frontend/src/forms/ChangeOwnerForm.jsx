import React, { useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { Form, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ChangeOwnerConfirmation from '../notifications/ChangeOwnerConfirmation';

const ChangeOwnerForm = ({ propertyId }) => {
    const [newOwnerId, setNewOwnerId] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(true);
    const [showChangeOwnerConfirm, setShowChangeOwnerConfirm] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const response = await axios.put(`${config.baseURL}/api/changeowner/${propertyId}/owner`, {
                newOwnerId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            toast.dark('Omistaja vaihdettu onnistuneesti! Uuden omistajan käyttäjä ID: ' + newOwnerId);
            setIsFormVisible(false); // hide the form
            navigate('/mypage'); // navigate to /mypage
            console.log(response.data);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    if (error.response.data === 'User ID not found') {
                        toast.error('Virhe! Käyttäjä ID ei löydy. Yritä uudelleen.');
                    } else if (error.response.data === 'Property already owned by the new owner') {
                        toast.error('Virhe! Kiinteistö on jo omistuksessa.');
                    } else {
                        toast.error('Virhe! Tarkista käyttäjä ID ja yritä uudelleen.');
                    }
                } else if (error.response.status === 404) {
                    toast.error('Virhe! Kiinteistöä ei löydy.');
                } else if (error.response.status === 500) {
                    toast.error('Virhe! Palvelinvirhe. Yritä myöhemmin uudelleen.');
                } else {
                    console.error(error);
                }
            } else {
                console.error(error);
            }
        }
    };

    return isFormVisible ? (
        <section>
            <Form onSubmit={(e) => { e.preventDefault(); setShowChangeOwnerConfirm(true); }}>
                <FloatingLabel controlId="floatingNewOwnerId" label="Uuden omistajan ID numero" className="mb-2 mt-2">
                    <Form.Control type="text" value={newOwnerId} onChange={e => setNewOwnerId(e.target.value)} />
                </FloatingLabel>
                <button className="primary-button" type="submit">Submit</button>
            </Form>
            <hr></hr>
            {showChangeOwnerConfirm && <ChangeOwnerConfirmation newOwnerId={newOwnerId} handleChangePropertyOwner={handleSubmit} setShowChangeOwnerConfirm={setShowChangeOwnerConfirm} />}
        </section>
    ) : null;
};

export default ChangeOwnerForm;