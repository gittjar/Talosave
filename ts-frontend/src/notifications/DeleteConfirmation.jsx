import { Modal, Button } from 'react-bootstrap';


const DeleteConfirmation = ({ handleDeleteProperty, setShowDeleteConfirm, fileName }) => {
  // optional chaining operator
  const title = fileName ? (
    <>
      Poistetaanko
      <br />
      {fileName}?
    </>
  ) : 'Poistetaanko tämä?';
  
  return (
    <Modal show={true} onHide={() => setShowDeleteConfirm(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button className='primary-button' onClick={() => { handleDeleteProperty(); setShowDeleteConfirm(false); }}>Kyllä, poista</Button>
        <Button className='danger-button' onClick={() => setShowDeleteConfirm(false)}>Ei, älä poista</Button>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmation;