
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import config from '../configuration/config';
import AddHeatingForm from '../forms/AddHeatingForm';
import colorMap from '../components/colorMap';


const ShowHeatingConsumption = () => {

    const { id } = useParams(); // Get the property ID from the URL
    const [heatingConsumptions, setHeatingConsumptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedYears, setSelectedYears] = useState([]);
    
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

  const years = [...new Set(heatingConsumptions.map(item => item.year))];
    years.sort();



    return (
        <div>

            <h3>Lämmityskulut</h3>
            {loading && <p>Loading data...</p>}
            <button onClick={() => setShowForm(prevShowForm => !prevShowForm)} className='edit-link'>
                {showForm ? 'Sulje lämmityskulutuksen lisäys' : 'Lisää lämmityskulutus'}
                </button>         
                <div className='kwh-labels-year'>
  {years.map(year => (
    <article key={year} style={{ backgroundColor: colorMap.getColor(year), padding: '5px', margin: '5px' }} className='mwh-box'>
        <input
          type="checkbox"
          value={year}
          checked={selectedYears.includes(year)}
          className="year-checkbox"
          onChange={e => {
            if (e.target.checked) {
              setSelectedYears(prevYears => [...prevYears, year]);
            } else {
              setSelectedYears(prevYears => prevYears.filter(y => y !== year));
            }
          }}
        />
        {year}
    </article>
  ))}
</div>

{showForm && <AddHeatingForm propertyId={id} refreshData={refreshData} />} 
            <Table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>kWh</th>
                        <th>MWh</th>
                        <th>Euros</th>

                    </tr>
                </thead>
                <tbody>
  {heatingConsumptions.filter(item => selectedYears.includes(item.year)).map((item, index) => (
    <tr key={index} style={{backgroundColor: colorMap.getColor(item.year)}}>
      <td>{item.month}</td>
      <td>{item.year}</td>
      <td>{item.kwh}</td>
      <td>{item.mwh}</td>
      <td>{item.euros}</td>
    </tr>
  ))}
</tbody>
            </Table>
        </div>
    );

};

export default ShowHeatingConsumption;