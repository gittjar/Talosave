import { Modal, Button } from 'react-bootstrap';

const ChangeOwnerConfirmation = ({ newOwnerId, handleChangePropertyOwner, setShowChangeOwnerConfirm }) => {
    return (
      <Modal show={true} onHide={() => setShowChangeOwnerConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Siirretäänkö kohde toiselle omistajalle?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Uuden omistajan käyttäjä ID: {newOwnerId}</p>
          <Button className='primary-button' onClick={() => { handleChangePropertyOwner(); setShowChangeOwnerConfirm(false); }}>Kyllä, siirrä</Button>
          <Button className='danger-button' onClick={() => setShowChangeOwnerConfirm(false)}>Peruuta</Button>
        </Modal.Body>
      </Modal>
    );
}

export default ChangeOwnerConfirmation;