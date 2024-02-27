import { Modal, Button } from 'react-bootstrap';

const DeleteDetailsConfirmation = ({ handleDeleteDetails, setShowDeleteDetailsConfirm }) => {
    return (
      <Modal show={true} onHide={() => setShowDeleteDetailsConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Huomio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Poista ensin remontin lisätietorivit ennenkuin voit poistaa koko remontin</p>
          <Button className="secondary-button" onClick={() => setShowDeleteDetailsConfirm(false)}>Ok</Button>
        </Modal.Body>
      </Modal>
    );
};

export default DeleteDetailsConfirmation;