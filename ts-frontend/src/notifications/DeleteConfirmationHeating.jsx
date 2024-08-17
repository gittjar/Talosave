import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationHeating = ({ handleDeleteProperty, setShowDeleteConfirm, deletingItem }) => {
  const monthNames = {
    1: 'Tammikuu',
    2: 'Helmikuu',
    3: 'Maaliskuu',
    4: 'Huhtikuu',
    5: 'Toukokuu',
    6: 'Kesäkuu',
    7: 'Heinäkuu',
    8: 'Elokuu',
    9: 'Syyskuu',
    10: 'Lokakuu',
    11: 'Marraskuu',
    12: 'Joulukuu'
  };

  return (
    <Modal show={true} onHide={() => setShowDeleteConfirm(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Poistetaanko nämä lämmitystiedot?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{monthNames[deletingItem.month]} / {deletingItem.year}</p>
        <Button className='primary-button' onClick={() => { handleDeleteProperty(); setShowDeleteConfirm(false); }}>Kyllä, poista</Button>
        <Button className='danger-button' onClick={() => setShowDeleteConfirm(false)}>Ei, älä poista</Button>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmationHeating;