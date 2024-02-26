import { useState } from 'react';

const DeleteConfirmation = ({ handleDeleteProperty, setShowDeleteConfirm }) => {
    return (
      <div className='confirmation'>
        <p>Poistetaanko tämä, vahvista?</p>
        <button onClick={() => { handleDeleteProperty(); setShowDeleteConfirm(false); }} className="danger-button">Kyllä, poista</button>
        <button onClick={() => setShowDeleteConfirm(false)} className="secondary-button">Ei, älä poista</button>
      </div>
    );
};

export default DeleteConfirmation;