import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import config from '../configuration/config';
import AddYearlyWaterForm from '../forms/AddYearlyWaterForm';
import { PlusLg } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import colorMap from '../components/colorMap';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLabel, VictoryTooltip, VictoryBar } from 'victory';

const ShowWaterConsumption = () => {

    const { id } = useParams(); // Get the property ID from the URL
    const [yearlyWaterConsumptions, setYearlyWaterConsumptions] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showYearlyForm, setShowYearlyForm] = useState(false);

    const fetchYearlyWaterConsumptions = async (propertyId) => {
        const token = localStorage.getItem('userToken'); // Get the token from local storage
    
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
            console.log('Yearly Data:', data); // Log the data
    
            return data; // Return the data
        } catch (error) {
            console.error('Error fetching yearly water consumptions:', error);
            return []; // Return an empty array in case of error
        }
    }

    useEffect(() => {
        console.log('Property ID:', id); // Log the property ID
        setLoading(true); // Set loading to true before fetching data
        fetchYearlyData();
    }, [id]);
    
    const fetchYearlyData = async () => {
        const yearlyData = await fetchYearlyWaterConsumptions(id);
        setYearlyWaterConsumptions(yearlyData);
        setSelectedYears(yearlyData.filter(item => item.m3).map(item => item.year)); // Select all years with M3 data by default
        setLoading(false);
    }

    const handleYearCheck = (year) => {
        setSelectedYears(prevYears => {
            if (prevYears.includes(year)) {
                return prevYears.filter(y => y !== year);
            } else {
                return [...prevYears, year];
            }
        });
    }

    const filteredData = yearlyWaterConsumptions.filter(item => selectedYears.includes(item.year));
    const validData = filteredData.filter(item => !isNaN(item.m3) && !isNaN(item.euros));
    const maxEuros = validData.length > 0 ? Math.max(...validData.map(item => item.euros)) : 0;


    return (
        <div>
            <h2>Vedenkulutus</h2>

            <section>
                <button onClick={() => setShowYearlyForm(prevShowForm => !prevShowForm)} className='edit-link'>
                    <PlusLg /> Add Yearly Water Consumption
                </button>
                {showYearlyForm && <AddYearlyWaterForm propertyId={id} refreshData={fetchYearlyData} />}
            </section>

            <h3>Vuosittainen vedenkulutus</h3>
            <section className='water-labels-year'>
            {yearlyWaterConsumptions.filter(item => item.m3).map(item => (
    <button
        key={item.year}
        style={{
            backgroundColor: selectedYears.includes(item.year) ? colorMap.getColor(item.year) : 'grey',
            padding: '5px',
            margin: '5px'
        }}
        className='m3-box'
        onClick={() => handleYearCheck(item.year)}
    >
        <section style={{ display: 'inline-block', marginLeft: '10px' }}>
            {item.year} ({item.m3.toFixed(1)} m³)
        </section>
    </button>
))}
            </section>
            <VictoryChart domainPadding={20} theme={VictoryTheme.material}>
    <VictoryAxis
        tickValues={validData.map(item => item.year)}
    />
    <VictoryAxis
        dependentAxis
        tickValues={validData.length > 0 ? Array.from({length: 5}, (_, i) => (validData.map(item => item.m3).reduce((a, b) => Math.max(a, b)) / 4) * i) : [0]}
        tickFormat={(t) => t.toFixed(1)}

   />
<VictoryBar
    data={validData}
    x="year"
    y="m3"
    style={{
        data: {
            fill: ({ datum }) => colorMap.getColor(datum.year)
        }
    }}
    labels={({ datum }) => `Year: ${datum.year}\nm³: ${datum.m3.toFixed(1)}\nEuros: ${datum.euros}`}
    labelComponent={<VictoryTooltip/>}
/>
  <VictoryLabel
    text="m³"
    x={30} // Adjust this value to position the label correctly
    y={30}  // Adjust this value to position the label correctly
    textAnchor="middle"
/>
</VictoryChart>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Consumption (m³)</th>
                        <th>Euros</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.filter(item => item.m3 && item.euros).map((item, index) => (
                        <tr key={index}>
                            <td>{item.year}</td>
                            <td>{item.m3}</td>
                            <td>{item.euros}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {loading && <p>Loading...</p>}
        </div>
    );
};

export default ShowWaterConsumption;