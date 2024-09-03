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
        } catch (error) {
            console.error(error);
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