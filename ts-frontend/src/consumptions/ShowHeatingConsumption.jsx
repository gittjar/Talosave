
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import config from '../configuration/config';
import AddHeatingForm from '../forms/AddHeatingForm';


const ShowHeatingConsumption = () => {

    const { id } = useParams(); // Get the property ID from the URL
    const [heatingConsumptions, setHeatingConsumptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);



    const fetchHeatingConsumptions = async (propertyId) => {
        const token = localStorage.getItem('userToken'); // Get the token from local storage
        console.log('Token:', token); // Log the token
      
        try {
          const response = await fetch(`${config.baseURL}/api/heatingconsumptions/${propertyId}`, {
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
          console.error('Error fetching heating consumptions:', error);
          return []; // Return an empty array in case of error
        }
      };



const refreshData = async () => {
  const data = await fetchHeatingConsumptions(id);
  setHeatingConsumptions(data);
  setLoading(false); 
  setShowForm(false);
}

useEffect(() => {
    console.log('Property ID:', id); // Log the property ID
    setLoading(true); // Set loading to true before fetching data
    refreshData();
  }, [id]);

    return (
        <div>

            <h1>Heating consumption</h1>
            {loading && <p>Loading data...</p>}
            <button onClick={() => setShowForm(true)}>Add Heating Consumption</button> 
            {showForm && <AddHeatingForm propertyId={id} refreshData={refreshData} />} 
            <Table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>kWh</th>
                        <th>Euros</th>
                        <th>MWh</th>

                    </tr>
                </thead>
                <tbody>
                    {heatingConsumptions.map((item, index) => (
                        <tr key={index}>
                            <td>{item.month}</td>
                            <td>{item.year}</td>
                            <td>{item.kwh}</td>
                            <td>{item.euros}</td>
                            <td>{item.mwh}</td>

                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );

};

export default ShowHeatingConsumption;