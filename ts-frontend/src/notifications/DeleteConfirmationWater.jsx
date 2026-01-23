import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationWater = ({ deleteItem, setShowDeleteConfirm, deletingItem }) => {
    console.log('DeleteConfirmationWater rendered with props:', { deleteItem, setShowDeleteConfirm, deletingItem });
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
  
    if (!deletingItem) {
      return null; // Don't render anything if deletingItem is not defined
    }
  
    return (
      <Modal show={true} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Poistetaanko nämä tiedot?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">{monthNames[deletingItem.month]} / {deletingItem.year}</p>
          <p className="text-danger fw-bold mb-3">
            Toimintoa ei voi perua, mikäli poistat kohteen: <strong>{monthNames[deletingItem.month]} {deletingItem.year}</strong>
          </p>
          <div className="d-flex gap-2">
            <Button variant="danger" onClick={() => { deleteItem(); setShowDeleteConfirm(false); }}>Kyllä, poista</Button>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Ei, älä poista</Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };
  
  export default DeleteConfirmationWater;