import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import DeleteConfirmation from '../notifications/DeleteConfirmation.jsx';

const Todos = ({ propertyId }) => {
    const [todos, setTodos] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showFormId, setShowFormId] = useState(null);

    const handleShowForm = (id) => {
        setShowFormId(id);
        setShowEditForm(true);
    }

    const handleCloseForm = () => {
        setShowFormId(null);
        setShowEditForm(false);
    }

    useEffect(() => {
        const token = localStorage.getItem('userToken');
    
        fetch(`${config.baseURL}/api/todo/${propertyId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(response => response.json())
          .then(data => setTodos(data))
          .catch(error => console.error('Error:', error));
      }, [propertyId]);

    const handleDeleteTodo = () => {
        const token = localStorage.getItem('userToken');
    
        fetch(`${config.baseURL}/api/todo/${todoToDelete.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(() => {
            deleteTodo(todoToDelete.id);
          })
          .catch(error => console.error('Error:', error));
      }

    const deleteTodo = (id) => {
        const newTodos = todos.filter(todo => todo.id !== id);
        setTodos(newTodos);
      }

    const handleEditTodo = (id) => {
        setShowEditForm(true);
        setShowFormId(id);
      }

    const handleShowDeleteConfirm = (todo) => {
        setTodoToDelete(todo);
        setShowDeleteConfirm(true);
      }

    const handleCloseDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setTodoToDelete(null);
      }

    return (
        <div>
        <h5>Tehtäviä</h5>
        <table className='todo-table'>
            <thead>
                <tr>
                    <th>Todo</th>
                    <th>Tehty</th>
                    <th>Hinta</th>
                    <th>Päiväys</th>
                    <th>Muokkaa</th>
                </tr>
            </thead>
            <tbody>
                {todos.map(todo => (
                    <tr key={todo.id} className={`panel ${todo.isCompleted ? 'panel-success' : 'panel-danger'}`}>
                        <td>{todo.action}</td>
                        <td>{todo.isCompleted ? 'Kyllä' : 'Ei'}</td>
                        <td>{todo.cost} €</td>
                        <td>{`${new Date(todo.date).getMonth() + 1}/${new Date(todo.date).getFullYear()}`}</td>
                        
                        <td>
                            <button className='edit-link' onClick={() => handleEditTodo(todo.id)}>Edit</button>
                            <button className='delete-link' onClick={() => handleShowDeleteConfirm(todo)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
            {showDeleteConfirm && (
                <DeleteConfirmation 
                    handleDeleteProperty={handleDeleteTodo} 
                    setShowDeleteConfirm={setShowDeleteConfirm} 
                />
            )}
        </div>
    );
}

export default Todos;