import React, { useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';

const ChangeOwnerForm = ({ propertyId }) => { // propertyId is now a prop
    const [newOwnerId, setNewOwnerId] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.put(`${config.baseURL}/api/changeowner/${propertyId}/owner`, {
                newOwnerId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });

            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                New Owner ID:
                <input type="text" value={newOwnerId} onChange={e => setNewOwnerId(e.target.value)} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    );
};

export default ChangeOwnerForm;