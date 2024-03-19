import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import DeleteConfirmation from '../notifications/DeleteConfirmation.jsx';
import Toast from 'react-bootstrap/Toast';


const RenovationDetails = ({ renovationId }) => {
  const [renovationDetails, setRenovationDetails] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [newDetail, setNewDetail] = useState(''); // State for the new detail input
  const [showToast, setShowToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // Add this line


  const showToastWithMessage = (message) => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000); // Hide the toast after 5 seconds
  };

  const fetchRenovationDetails = () => {
    const token = localStorage.getItem('userToken'); // Assuming you store your token in localStorage
  
    fetch(`${config.baseURL}/api/renovationdetails/${renovationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setRenovationDetails(data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken'); // Assuming you store your token in localStorage

    fetch(`${config.baseURL}/api/renovationdetails/${renovationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setRenovationDetails(data))
      .catch(error => console.error('Error:', error));
  }, [renovationId]);

  const handleNewDetail = (event) => {
    event.preventDefault();

    const token = localStorage.getItem('userToken');

    // Post the new detail
    fetch(`${config.baseURL}/api/renovationdetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        renovationid: renovationId,
        detail: newDetail
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      // Check if the response body is empty
      if (response.headers.get('content-length') === '0' || !response.headers.get('content-type').includes('application/json')) {
        return;
      }
      return response.json();
    })
    .then(data => {
      if (data) {
        // Add the new detail to the list
        setRenovationDetails([...renovationDetails, data]);
      }
      // Clear the input
      setNewDetail('');
      fetchRenovationDetails();
      showToastWithMessage('Detail edited successfully!');
    })
    .catch(error => console.error('Error:', error));
  };

  const handleEdit = (id, detail) => {
    setEditingId(id);
    setEditingText(detail);
  };

  const handleSave = (id) => {
    const token = localStorage.getItem('userToken');
    console.log('Token:', token); // Log the token
  
    // Update the detail
    fetch(`${config.baseURL}/api/renovationdetails/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        detail: editingText
      })
    })
    .then(response => {
      console.log('Response:', response); // Log the response
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('Data:', data); // Log the data
      // Stop editing after the renovation details have been refetched
      setEditingId(null);
    })
    .catch(error => console.error('Error:', error))
    .finally(() => {
      // Refetch the renovation details
      fetchRenovationDetails();
      showToastWithMessage('Detail edited successfully!');

    });
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('userToken');

    // Delete the detail
    fetch(`${config.baseURL}/api/renovationdetails/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        // Remove the detail from the list
        setRenovationDetails(renovationDetails.filter(detail => detail.id !== id));
        fetchRenovationDetails();
      })
      .catch(error => console.error('Error:', error));
  };

  const handleDeleteConfirmation = (id) => {
    setShowDeleteConfirm(true);
    setDeleteId(id); // Set the id of the detail to be deleted
  };
  
  const handleDeleteProperty = () => {
    handleDelete(deleteId); // Delete the detail
    setShowDeleteConfirm(false); // Close the confirmation dialog
  };

  return (
    <div>
      <form onSubmit={handleNewDetail}>
        <input
          type="text"
          value={newDetail}
          onChange={e => setNewDetail(e.target.value)}
          placeholder="Lisää remonttiin liittyvä tieto"
        />
        <button className='primary-button' type="submit">Lisää</button>
      </form>

      <div className='thinline'></div>

      {renovationDetails.length > 0 ? (
  <table>
    <thead>
      <tr>
        <th style={{ width: '80%' }}>Remontin tietoja</th>
        <th style={{ width: '20%' }}>Toiminnot</th>
      </tr>
    </thead>
    <tbody>
      {renovationDetails.map((detail) => (
        <tr key={detail.id}>
          <td style={{ width: '80%' }}>
            {editingId === detail.id ? (
              <input
                type="text"
                value={editingText}
                onChange={e => setEditingText(e.target.value)}
              />
            ) : (
              detail.detail
            )}
          </td>
          <td style={{ width: '20%' }}>
            {editingId === detail.id ? (
              <button className='secondary-button' onClick={() => handleSave(detail.id)}>Save</button>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className='edit-link' onClick={() => handleEdit(detail.id, detail.detail)}>Muokkaa</button>
                <button className='delete-link' onClick={() => handleDeleteConfirmation(detail.id)}>Poista</button>

              </div>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p>No details found for this renovation.</p>
)}

<div style={{
  position: 'fixed',
  zIndex: 1000,
  top: 40,
  left: '50%',
  transform: 'translate(-50%, 0)',
}}>
  <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide>
    <Toast.Header>
      <strong className="me-auto">Informaatio</strong>
    </Toast.Header>
    <Toast.Body>Tiedot tallennettu onnistuneesti!</Toast.Body>
  </Toast>
</div>

{showDeleteConfirm && (
  <DeleteConfirmation 
    handleDeleteProperty={handleDeleteProperty} 
    setShowDeleteConfirm={setShowDeleteConfirm} 
  />
)}

    </div>
  );
};

export default RenovationDetails;