// EditRenovationForm.jsx
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';


const EditRenovationForm = ({ renovation, handleEditRenovation, onCancel }) => {
  const [updatedRenovation, setUpdatedRenovation] = useState(renovation);

  const handleSubmit = (event) => {
    event.preventDefault();
    handleEditRenovation(updatedRenovation);
  };

  const handleChange = (event) => {
    setUpdatedRenovation({
      ...updatedRenovation,
      [event.target.name]: event.target.value
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border rounded bg-white mb-3">
      <h5 className="mb-3">Muokkaa remonttia</h5>
      
      <Form.Group controlId="formConstructionCompany" className="mb-3">
        <Form.Label>Urakoitsija</Form.Label>
        <Form.Control 
          type="text" 
          name="construction_company" 
          placeholder="Syötä urakoitsija" 
          defaultValue={renovation.construction_company} 
          onChange={handleChange} 
        />
      </Form.Group>
      
      <Form.Group controlId="formRenovation" className="mb-3">
        <Form.Label>Remontti</Form.Label>
        <Form.Control 
          type="text" 
          name="renovation" 
          placeholder="Syötä remontti" 
          defaultValue={renovation.renovation} 
          onChange={handleChange} 
          required
        />
      </Form.Group>
      
      <Form.Group controlId="formDate" className="mb-3">
        <Form.Label>Päivämäärä</Form.Label>
        <Form.Control 
          type="date" 
          name="date" 
          defaultValue={renovation.date ? renovation.date.split('T')[0] : ''} 
          onChange={handleChange} 
          required
        />
      </Form.Group>
      
      <Form.Group controlId="formCost" className="mb-3">
        <Form.Label>Hinta (€)</Form.Label>
        <Form.Control 
          type="number" 
          name="cost" 
          placeholder="Syötä hinta" 
          defaultValue={renovation.cost} 
          onChange={handleChange} 
        />
      </Form.Group>
      
      <ButtonGroup>
        <Button variant="success" type="submit">
          Tallenna
        </Button>
        <Button 
          variant="dark" 
          type="button"
          onClick={onCancel}
        >
          Peruuta
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default EditRenovationForm;