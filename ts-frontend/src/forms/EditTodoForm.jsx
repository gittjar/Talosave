import React, { useState, useEffect } from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

const EditTodoForm = ({ todo, handleUpdateTodo, handleCloseForm }) => {
  const [updatedTodo, setUpdatedTodo] = useState(todo);

  useEffect(() => {
    setUpdatedTodo(todo);
  }, [todo]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedTodo({ ...updatedTodo, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleUpdateTodo(updatedTodo.id, updatedTodo);
    handleCloseForm();
  };

  return (
    <Modal show={true} onHide={handleCloseForm}>
      <Modal.Header closeButton>
        <Modal.Title>Muokkaa tehtävää</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="action">Tehtävä tai tarkistus</label>
            <input
              type="text"
              className="form-control"
              id="action"
              name="action"
              value={updatedTodo.action}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="input-group mb-2 mt-2">
            <div className="input-group-prepend">
              <div className="input-group-text">
                <label htmlFor="isCompleted" className='p-2'>Tehty</label>
                <input
                  className=''
                  type="checkbox"
                  aria-label="Checkbox for following text input"
                  id="isCompleted"
                  name="isCompleted"
                  checked={updatedTodo.isCompleted}
                  onChange={e => handleInputChange({ target: { name: e.target.name, value: e.target.checked } })}
                />
              </div>
            </div>
          </div>
          <div className="form-group mb-2">
            <label htmlFor="date">Päiväys</label>
            <input
              type="date"
              className="form-control"
              id="date"
              name="date"
              value={updatedTodo.date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group mb-2">
            <label htmlFor="cost">Kulut</label>
            <input
              type="number"
              className="form-control"
              id="cost"
              name="cost"
              value={updatedTodo.cost}
              onChange={handleInputChange}
              required
            />
          </div>
          <ButtonGroup>
            <Button type="submit" variant="success">Päivitä</Button>
            <Button type="button" variant="dark" onClick={handleCloseForm}>Peruuta</Button>
          </ButtonGroup>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditTodoForm;