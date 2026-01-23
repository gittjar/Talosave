import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmation = ({ handleDeleteProperty, setShowDeleteConfirm, fileName, todoTitle, renovationName }) => {
  const title = todoTitle ? (
    <>
      Poistetaanko tehtävä
      <br />
      "{todoTitle}"?
    </>
  ) : fileName ? (
    <>
      Poistetaanko
      <br />
      {fileName}?
    </>
  ) : renovationName ? (
    <>
      Poistetaanko remontti
      <br />
      "{renovationName}"?
    </>
  ) : 'Poistetaanko tämä?';

  const itemName = renovationName || todoTitle || fileName || 'kohteen';

  return (
    <Modal show={true} onHide={() => setShowDeleteConfirm(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-danger fw-bold mb-3">
          Toimintoa ei voi perua, mikäli poistat kohteen: <strong>{itemName}</strong>
        </p>
        <div className="d-flex gap-2">
          <Button variant="danger" onClick={() => { handleDeleteProperty(); setShowDeleteConfirm(false); }}>Kyllä, poista</Button>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Ei, älä poista</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmation;