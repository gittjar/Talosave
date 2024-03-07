import React, { useState, useEffect } from 'react';

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
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className='mt-3'>Muokkaa tehtävää</h4>
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
      <button type="submit" className="primary-button">Päivitä</button>
      <button type="button" className="secondary-button" onClick={handleCloseForm}>Peruuta</button>
    </form>
  );
};

export default EditTodoForm;