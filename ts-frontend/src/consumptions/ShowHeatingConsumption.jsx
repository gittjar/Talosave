
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import config from '../configuration/config';
import AddHeatingForm from '../forms/AddHeatingForm';
import colorMap from '../components/colorMap';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLabel, VictoryTooltip } from 'victory';



const ShowHeatingConsumption = () => {

    const { id } = useParams(); // Get the property ID from the URL
    const [heatingConsumptions, setHeatingConsumptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedYears, setSelectedYears] = useState([]);
    const [unit, setUnit] = useState('kwh'); // Add this state variable

    
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

    const monthNames = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];



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

<section className='d-flex'>
<article className='m-4'>
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
            </article>


            <article className='p-2 border border-secondary rounded-lg'>
            <h5>Lämmityskulut vuosittain</h5>
            <div className="d-flex align-items-center">
                <div className="form-check form-check-inline">
                <input 
                type="radio" 
                id="kwh" 
                name="unit" 
                value="kwh" 
                checked={unit === 'kwh'} 
                onChange={e => setUnit(e.target.value)} 
                />
                <label className="form-check-label" htmlFor="kwh">kWh</label>
            </div>
            <div className="">
                <input 
                 
                type="radio" 
                id="mwh" 
                name="unit" 
                value="mwh" 
                checked={unit === 'mwh'} 
                onChange={e => setUnit(e.target.value)} 
                />
                <label className="form-check-label" htmlFor="mwh">MWh</label>
            </div>
            </div>
    
            <VictoryChart 
                    domainPadding={30} 
                    padding={{ top: 20, bottom: 80, left: 100, right: 100 }} // Increase the bottom and left padding here
                    style={{ parent: { marginBottom: '50px' } }}
                    width={850} // Set the chart width here
                    >
                    <VictoryAxis 
                        tickValues={monthNames} 
                        tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} 
                    />
                    <VictoryAxis 
                        dependentAxis 
                        label={unit} 
                        style={{ axisLabel: { padding: 55 } }} 
                    />
                    {selectedYears.map(year => (
                        <VictoryLine
                        key={year}
                        data={heatingConsumptions.filter(consumption => consumption.year === year).map(consumption => ({...consumption, month: monthNames[consumption.month - 1]}))}
                        x="month"
                        y={unit}
                        style={{ data: { stroke: colorMap.getColor(year) } }}
                        labelComponent={<VictoryTooltip />}
                        labels={({ datum }) => `kWh: ${datum.kwh}\nEuros: ${datum.euros}`}
                        />
                    ))}
                    </VictoryChart>
    </article>
</section>
        </div>
    );

};

export default ShowHeatingConsumption;