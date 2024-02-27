import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmation = ({ handleDeleteProperty, setShowDeleteConfirm }) => {
    return (
      <Modal show={true} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Poistetaanko tämä?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button className='primary-button' onClick={() => { handleDeleteProperty(); setShowDeleteConfirm(false); }}>Kyllä, poista</Button>
          <Button className='danger-button' onClick={() => setShowDeleteConfirm(false)}>Ei, älä poista</Button>
        </Modal.Body>
      </Modal>
    );
};

export default DeleteConfirmation;