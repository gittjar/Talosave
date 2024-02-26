// DeleteDetailsConfirmation.js
import React from 'react';

const DeleteDetailsConfirmation = ({ handleDeleteDetails, setShowDeleteDetailsConfirm }) => {
    return (
      <div className='confirmation'>
        <p>Poista ensin remontin lisätietorivit ennenkuin voit poistaa koko remontin</p>
        <button onClick={() => setShowDeleteDetailsConfirm(false)} className="secondary-button">Ok</button>
      </div>
    );
};

export default DeleteDetailsConfirmation;