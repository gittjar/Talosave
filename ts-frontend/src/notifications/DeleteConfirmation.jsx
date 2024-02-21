import { useState } from 'react';

const DeleteConfirmation = ({ handleDeleteProperty, setShowDeleteConfirm }) => {
    return (
      <div className='confirmation'>
        <p>Are you sure you want to delete this property?</p>
        <button onClick={handleDeleteProperty} className="danger-button">Yes, delete</button>
        <button onClick={() => setShowDeleteConfirm(false)} className="secondary-button">No, cancel</button>
      </div>
    );
  };

export default DeleteConfirmation;