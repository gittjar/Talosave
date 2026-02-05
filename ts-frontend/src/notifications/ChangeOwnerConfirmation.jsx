import { Modal, Button, ButtonGroup } from 'react-bootstrap';

const ChangeOwnerConfirmation = ({ newOwnerId, handleChangePropertyOwner, setShowChangeOwnerConfirm }) => {
    return (
      <Modal show={true} onHide={() => setShowChangeOwnerConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Siirretäänkö kohde toiselle omistajalle?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Uuden omistajan käyttäjä ID: {newOwnerId}</p>
        <ButtonGroup>
          <Button variant="success" onClick={() => { handleChangePropertyOwner(); setShowChangeOwnerConfirm(false); }}>Kyllä, siirrä</Button>
          <Button variant="dark" onClick={() => setShowChangeOwnerConfirm(false)}>Peruuta</Button>
        </ButtonGroup>
        </Modal.Body>
      </Modal>
    );
}

export default ChangeOwnerConfirmation;