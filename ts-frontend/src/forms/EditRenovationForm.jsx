// EditRenovationForm.jsx
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const EditRenovationForm = ({ renovation, handleEditRenovation }) => {
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
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formConstructionCompany">
        <Form.Label>Construction Company</Form.Label>
        <Form.Control type="text" name="construction_company" placeholder="Enter construction company" defaultValue={renovation.construction_company} onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="formRenovation">
        <Form.Label>Renovation</Form.Label>
        <Form.Control type="text" name="renovation" placeholder="Enter renovation" defaultValue={renovation.renovation} onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="formDate">
        <Form.Label>Date</Form.Label>
        <Form.Control type="date" name="date" defaultValue={renovation.date} onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="formCost">
        <Form.Label>Cost</Form.Label>
        <Form.Control type="number" name="cost" placeholder="Enter cost" defaultValue={renovation.cost} onChange={handleChange} />
      </Form.Group>
      <Button className="primary-button" type="submit">
        Tallenna
      </Button>
    </Form>
  );
};

export default EditRenovationForm;