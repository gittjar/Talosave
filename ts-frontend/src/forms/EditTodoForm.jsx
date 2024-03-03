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
      <input
        type="text"
        name="action"
        value={updatedTodo.action}
        onChange={handleInputChange}
      />
      {/* Add other form fields as needed */}
      <button type="submit">Update Todo</button>
    </form>
  );
};

export default EditTodoForm;