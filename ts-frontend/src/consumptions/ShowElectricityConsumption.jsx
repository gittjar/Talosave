import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { useParams } from 'react-router-dom';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel, VictoryTooltip, VictoryGroup, VictoryArea } from 'victory';

const ShowElectricityConsumption = () => {
  const { id } = useParams(); // Get the property ID from the URL
  const [electricityConsumptions, setElectricityConsumptions] = useState([]);
  const [selectedYears, setSelectedYears] = useState([2022, 2023]); // Initial selected years
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const fetchElectricityConsumptions = async () => {
      const token = localStorage.getItem('userToken'); 
  
      try {
        const response = await axios.get(`${config.baseURL}/api/electricconsumptions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        setElectricityConsumptions(response.data);
  
        // Get unique years from the data
        const uniqueYears = [...new Set(response.data.map(item => item.year))];
        setYears(uniqueYears);
  
        setLoading(false);
      } catch (error) {
        console.error('Error fetching electricity consumptions:', error);
        // Handle error as needed
      }
    };
  
    fetchElectricityConsumptions();
  }, [id]);

  const handleYearChange = (event) => {
    const year = Number(event.target.value);
    setSelectedYears(selectedYears =>
      selectedYears.includes(year)
        ? selectedYears.filter(y => y !== year)
        : [...selectedYears, year]
    );
  };
  
  // Filter the electricityConsumptions array to only include the records for the current property
  const currentPropertyConsumptions = electricityConsumptions.filter(consumption => 
    consumption.propertyid === Number(id) && selectedYears.includes(consumption.year)
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  

  const monthNames = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];
  
  const colorMap = {
    2019: 'lightblue',
    2020: 'darkblue',
    2021: 'green',
    2022: 'khaki',
    2023: 'orange',
    2024: 'pink',
    2025: 'purple',
    2026: 'lightgreen',
    2027: 'lightgrey',
    getColor: function(year) {
      return this[year] || getRandomColor();
    }
  };

  return (
    <div>
    <h3>Electricity Consumption Details</h3>
<div>
<div>
  {years.map(year => (
    <label key={year} style={{ backgroundColor: colorMap.getColor(year), padding: '5px', margin: '5px' }}>
              <input
        type="checkbox"
        value={year}
        checked={selectedYears.includes(year)}
        onChange={handleYearChange}
      />
      {year}
    </label>
  ))}
</div>

</div>
<VictoryChart 
  domainPadding={30} 
  padding={{ top: 20, bottom: 80, left: 100, right: 100 }} // Increase the bottom and left padding here
  style={{ parent: { marginBottom: '50px' } }}
  width={850} // Set the chart width here
>
  <VictoryAxis tickValues={monthNames} tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} />
  <VictoryAxis dependentAxis label="kWh" style={{ axisLabel: { padding: 35 } }} />
  <VictoryGroup offset={25}> 
    {[...selectedYears].reverse().map(year => (
      <VictoryBar
        key={year}
        barWidth={25} // Set the bar width here
        data={currentPropertyConsumptions.filter(consumption => consumption.year === year).map(consumption => ({...consumption, month: monthNames[consumption.month - 1]}))}
        x="month"
        y="kwh"
        style={{ data: { fill: colorMap.getColor(year) } }}
        labelComponent={<VictoryTooltip />}
        labels={({ datum }) => `kWh: ${datum.kwh}\nEuros: ${datum.euros}`}
        />
    ))}
  </VictoryGroup>
</VictoryChart>


<VictoryChart 
domainPadding={0} 
style={{ parent: { marginBottom: '50px' } }}
width={550} // Set the chart width here
>
  <VictoryAxis tickValues={monthNames} tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} />
  <VictoryAxis dependentAxis label="Euros" style={{ axisLabel: { padding: 35 } }} />
  {selectedYears.map(year => (
  <VictoryArea
        key={year}
        data={currentPropertyConsumptions.filter(consumption => consumption.year === year).map(consumption => ({...consumption, month: monthNames[consumption.month - 1]}))}
        x="month"
        y="euros"
        style={{ data: { fill: colorMap.getColor(year), stroke: colorMap.getColor(year) } }}
      
        />
  ))}
</VictoryChart>

      {currentPropertyConsumptions.map((consumption, index) => (
        <div key={index}>
          <p>Property Name: {consumption.propertyname}</p>
          <p>Property ID: {consumption.propertyid}</p>
          <p>Month: {consumption.month}</p>
          <p>Year: {consumption.year}</p>
          <p>kWh: {consumption.kwh}</p>
          <p>Euros: {consumption.euros}</p>
        </div>
      ))}
    </div>
  );
};

export default ShowElectricityConsumption;