// Import useEffect and useState hooks from React
import { useState, useEffect } from 'react';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';

// Define your AddRenovationForm component

const AddTodoForm = ({ propertyId, refreshData, closeForm }) => {

    // Define state variables for your form fields
    const [propertyid, setPropertyid] = useState(propertyId);
    const [action, setAction] = useState('');
    const [date, setDate] = useState('');
    const [userid, setUserid] = useState(null);
    const [cost, setCost] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);


    // When the component mounts, get the userid from local storage
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserid(storedUserId);
        }
      }, []);
    
      // Define your form submission handler
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
      isCompleted: Number(isCompleted), // Convert boolean to number
      date,
      cost,
      propertyid,
      userid
    })
  });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    refreshData();

    closeForm();

    toast.success('Uusi todo lisätty onnistuneesti!');

} catch (error) {
    console.error('Failed to add todo:', error);
}

}

// Define your form fields

return (

    <form onSubmit={handleSubmit}>

<div className="form-group">
    <label htmlFor="renovation">Tehtävä tai tarkistus</label>
    <input type="text" className="form-control" id="renovation" onChange={(event) => setAction(event.target.value)} required />
</div>

<div className="input-group mb-2 mt-2">
    <div className="input-group-prepend">
        <div className="input-group-text">
            <label htmlFor="isCompleted" className='p-2'>Tehty</label>
            <input className=''  type="checkbox" aria-label="Checkbox for following text input" checked={isCompleted} onChange={(event) => setIsCompleted(event.target.checked)} />
        </div>
    </div>
</div>

<div className="form-group mb-2">
    <label htmlFor="date">Päiväys</label>
    <input type="date" className="form-control" id="date" value={date} onChange={(event) => setDate(event.target.value)} required />
</div>

<div className="form-group mb-2">
    <label htmlFor="cost">Kulut</label>
    <input type="number" className="form-control" id="cost" value={cost} onChange={(event) => setCost(event.target.value)} required />
</div>



<button type="submit" className="primary-button">Tallenna</button>

</form>

);

}

export default AddTodoForm;
