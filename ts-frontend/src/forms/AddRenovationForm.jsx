import React, { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const BigToast = ({ closeToast, message }) => (
  <div className="big-toast">
    <h1>Error!</h1>
    <p className="toast-message">{message}</p>
    <button className='btn-danger' onClick={closeToast}>Close</button>
  </div>
);

const AddRenovationForm = ({ propertyId, refreshData, closeForm }) => {
  const [propertyid, setPropertyid] = useState(propertyId);
  const [construction_company, setConstructionCompany] = useState('');
  const [renovation, setRenovation] = useState('');
  const [date, setDate] = useState('');
  const [userid, setUserid] = useState(null);
  const [cost, setCost] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserid(storedUserId);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!construction_company) newErrors.construction_company = 'Remontin tekijä on pakollinen';
    if (!renovation) newErrors.renovation = 'Remontti on pakollinen';
    if (!date) newErrors.date = 'Päivämäärä on pakollinen';
    if (!cost) newErrors.cost = 'Remontin arvo on pakollinen';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('userToken');
    const dateObj = new Date(date);

    try {
      const response = await fetch(`${config.baseURL}/api/renovations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyid,
          construction_company,
          renovation,
          date: dateObj,
          cost,
          userid
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Uusi remontti lisätty onnistuneesti!');
      refreshData();
      closeForm();
      setConstructionCompany('');
      setRenovation('');
      setDate('');
      setCost('');
    } catch (error) {
      console.error('Error:', error);
      toast.error(<BigToast message={error.message} />);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Lisää remontti</h5>
            <button type="button" className="close" onClick={closeForm} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="propertyid">Kiinteistö ID: </label>
                <span id="propertyid"> {propertyid}</span>
              </div>
              <div className="form-group">
                <label htmlFor="construction_company">Remontin tekijä</label>
                <input
                  type="text"
                  className="form-control"
                  id="construction_company"
                  value={construction_company}
                  onChange={e => {
                    setConstructionCompany(e.target.value);
                    if (errors.construction_company) {
                      setErrors(prevErrors => ({ ...prevErrors, construction_company: '' }));
                    }
                  }}
                />
                {errors.construction_company && <div className="text-danger">{errors.construction_company}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="renovation">Remontti</label>
                <input
                  type="text"
                  className="form-control"
                  id="renovation"
                  value={renovation}
                  onChange={e => {
                    setRenovation(e.target.value);
                    if (errors.renovation) {
                      setErrors(prevErrors => ({ ...prevErrors, renovation: '' }));
                    }
                  }}
                />
                {errors.renovation && <div className="text-danger">{errors.renovation}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="date">Päivämäärä</label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  value={date}
                  onChange={e => {
                    setDate(e.target.value);
                    if (errors.date) {
                      setErrors(prevErrors => ({ ...prevErrors, date: '' }));
                    }
                  }}
                />
                {errors.date && <div className="text-danger">{errors.date}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="cost">Remontin arvo (€)</label>
                <input
                  type="number"
                  className="form-control"
                  id="cost"
                  value={cost}
                  onChange={e => {
                    setCost(e.target.value);
                    if (errors.cost) {
                      setErrors(prevErrors => ({ ...prevErrors, cost: '' }));
                    }
                  }}
                />
                {errors.cost && <div className="text-danger">{errors.cost}</div>}
              </div>
              <div className="btn-group" role="group">
                <button type="submit" className="btn btn-success mb-1">Tallenna</button>
                <button type="button" className="btn btn-dark mb-1" onClick={closeForm}>Peruuta</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRenovationForm;