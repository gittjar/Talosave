import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import config from '../configuration/config';
import AddWaterForm from '../forms/AddWaterForm';
import colorMap from '../components/colorMap';
import { PlusLg } from 'react-bootstrap-icons';
import DeleteConfirmationWater from '../notifications/DeleteConfirmationWater';
import { toast } from 'react-toastify';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLabel, VictoryTooltip } from 'victory';

const ShowWaterConsumption = () => {

    const { id } = useParams(); // Get the property ID from the URL
    const [waterConsumptions, setWaterConsumptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [unit, setUnit] = useState('m³'); // Add this state variable
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchWaterConsumptions = async (propertyId) => {
        const token = localStorage.getItem('userToken'); // Get the token from local storage
        console.log('Token:', token); // Log the token

        try {
            const response = await fetch(`${config.baseURL}/api/waterconsumptions/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Parse the response as JSON
            console.log('Data:', data); // Log the data

            return data; // Return the data
        } catch (error) {
            console.error('Error fetching water consumptions:', error);
            return []; // Return an empty array in case of error

        }
    }

    // Delete water consumption function here

    const deleteWaterConsumption = async (propertyId, month, year) => {
        const token = localStorage.getItem('userToken'); // Get the token from local storage
    
        try {
            const response = await fetch(`${config.baseURL}/api/waterconsumptions/`, {
                method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ propertyid: propertyId, month, year }) // Send the property ID, month, and year in the request body
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          console.log('Water data successfully deleted.');
            toast.dark('Tietue poistetty onnistuneesti.'); // Show a success toast
          refreshData(); // Refresh the data after deleting
        } catch (error) {
          console.error('Error deleting water consumption:', error);
        }
      };


    useEffect(() => {
        console.log('Property ID:', id); // Log the property ID
        setLoading(true); // Set loading to true before fetching data
        refreshData();
    }, [id]);

    const refreshData = async () => {
        const data = await fetchWaterConsumptions(id);
        setWaterConsumptions(data);
        setLoading(false);
        setShowForm(false);
    }

    const closeForm = () => {
        setIsFormOpen(false);
      };

    return (
        <div>
            <h2>Vedenkulutus</h2>

            <section>
            <button onClick={() => setShowForm(prevShowForm => !prevShowForm)} className='edit-link'>
                <PlusLg /> Lisää vedenkulutus / kuukausi
            </button>
            {showForm && <AddWaterForm propertyId={id} refreshData={refreshData} />}

            <button className='edit-link'> <PlusLg /> Lisää vedenkulutus / koko vuosi
 </button>
            </section>
      

            {loading && <p>Loading...</p>}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Consumption</th>
                        <th>Euros</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {waterConsumptions.map((item, index) => (
                        <tr key={index}>
                            <td>{item.month}</td>
                            <td>{item.year}</td>
                            <td>{(item.liters / 1000).toFixed(2)} /  {unit} </td>
                           <td>{item.euros}</td>
                            <td>
                                <button className="delete-link" onClick={() => {
                                    setShowDeleteConfirm(true);
                                    setDeletingItem(item);
                                }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {showDeleteConfirm && (
                <DeleteConfirmationWater
    deleteItem={() => {
        deleteWaterConsumption(id, deletingItem.month, deletingItem.year)
            .then(() => {
                refreshData();
                setShowDeleteConfirm(false);
            });
    }}
    setShowDeleteConfirm={setShowDeleteConfirm}
    deletingItem={deletingItem}
/>
)}
        </div>
    );
};

export default ShowWaterConsumption;