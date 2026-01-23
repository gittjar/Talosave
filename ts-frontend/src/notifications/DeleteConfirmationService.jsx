import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationService = ({ service, onConfirm, onCancel }) => {
  return (
    <Modal show={true} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Vahvista poisto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Haluatko varmasti poistaa huollon?</p>
        <div className="bg-light p-3 rounded">
          <strong>{service.servicename}</strong>
          {service.provider && (
            <div className="text-muted small mt-1">
              Palveluntarjoaja: {service.provider}
            </div>
          )}
          {service.servicedate && (
            <div className="text-muted small">
              Päivämäärä: {new Date(service.servicedate).toLocaleDateString('fi-FI')}
            </div>
          )}
        </div>
        <p className="text-danger mt-3 mb-0">
          Tätä toimintoa ei voi peruuttaa.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Peruuta
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Poista huolto
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationService;
