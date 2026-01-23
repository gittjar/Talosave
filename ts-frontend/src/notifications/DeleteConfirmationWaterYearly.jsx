import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const DeleteConfirmationWater = ({ show, deleteItem, setShowDeleteConfirm, deletingItem }) => {
    const year = deletingItem ? deletingItem.year : '';
    
    return (
        <Modal show={show} onHide={() => setShowDeleteConfirm(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Poistetaanko kohde</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-2">Poistetaanko vuoden {year} tiedot?</p>
                <p className="text-danger fw-bold mb-3">
                    Toimintoa ei voi perua, mikäli poistat kohteen: <strong>Vuosi {year}</strong>
                </p>
                <div className="d-flex gap-2">
                    <Button variant="danger" onClick={() => { deleteItem(); setShowDeleteConfirm(false); }}>Kyllä, poista</Button>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Ei, älä poista</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default DeleteConfirmationWater;