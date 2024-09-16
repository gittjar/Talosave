import React from 'react';
import Modal from 'react-bootstrap/Modal';

const DeleteConfirmationWater = ({ show, deleteItem, setShowDeleteConfirm, deletingItem }) => {
    return (
        <Modal show={show} onHide={() => setShowDeleteConfirm(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Poistetaanko kohde</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Poistetaanko vuoden {deletingItem ? deletingItem.year : ''} tiedot?</p>
                <button className='primary-button' onClick={() => { deleteItem(); setShowDeleteConfirm(false); }}>Kyllä, poista</button>
                <button className='danger-button' onClick={() => setShowDeleteConfirm(false)}>Ei, älä poista</button>
            </Modal.Body>
        </Modal>
    );
}

export default DeleteConfirmationWater;