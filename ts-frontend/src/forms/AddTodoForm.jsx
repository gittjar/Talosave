import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';

const AddTodoForm = ({ propertyId, refreshData, closeForm, show }) => {
  const [propertyid, setPropertyid] = useState(propertyId);
  const [action, setAction] = useState('');
  const [date, setDate] = useState('');
  const [userid, setUserid] = useState(null);
  const [cost, setCost] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserid(storedUserId);
    }
  }, []);

  useEffect(() => {
    setPropertyid(propertyId);
  }, [propertyId]);

  useEffect(() => {
    if (show) {
      // Reset form fields when the modal is opened
      setAction('');
      setDate('');
      setCost('');
      setIsCompleted(false);
    }
  }, [show]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('userToken');

    try {
      const response = await fetch(`${config.baseURL}/api/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          isCompleted: Number(isCompleted),
          date,
          cost,
          propertyid,
          userid
        })
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Failed to add todo:', errorResponse);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      refreshData();
      closeForm();
      toast.success('Uusi todo lisätty onnistuneesti!');
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  return (
    <Modal show={show} onHide={closeForm}>
      <Modal.Header closeButton>
        <Modal.Title>Lisää tehtävä</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="renovation">Tehtävä tai tarkistus</label>
            <input
              type="text"
              className="form-control"
              id="renovation"
              value={action}
              onChange={(event) => setAction(event.target.value)}
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
                  checked={isCompleted}
                  onChange={(event) => setIsCompleted(event.target.checked)}
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
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
          <div className="form-group mb-2">
            <label htmlFor="cost">Kulut</label>
            <input
              type="number"
              className="form-control"
              id="cost"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="primary-button">Tallenna</Button>
          <Button type="button" className="secondary-button" onClick={closeForm}>Peruuta</Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTodoForm;