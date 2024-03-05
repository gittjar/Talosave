import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { useParams } from 'react-router-dom';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from 'victory';

const ShowElectricityConsumption = () => {
  const { id } = useParams(); // Get the property ID from the URL
  const [electricityConsumptions, setElectricityConsumptions] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching electricity consumptions:', error);
        // Handle error as needed
      }
    };

    fetchElectricityConsumptions();
  }, [id]);
  
  // Filter the electricityConsumptions array to only include the records for the current property
  const currentPropertyConsumptions = electricityConsumptions.filter(consumption => consumption.propertyid === Number(id));
  
  if (loading) {
    return <div>Loading...</div>;
  }

  const monthNames = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];

  return (
    <div>
      <h3>Electricity Consumption Details</h3>
      <VictoryChart domainPadding={20} style={{ parent: { marginBottom: '50px' } }}>
        <VictoryAxis tickValues={monthNames} tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} />
        <VictoryAxis dependentAxis label="kWh" style={{ axisLabel: { padding: 35 } }} />
        <VictoryBar
          data={currentPropertyConsumptions.map(consumption => ({...consumption, month: monthNames[consumption.month - 1]}))}
          x="month"
          y="kwh"
        />
      </VictoryChart>
      <VictoryChart domainPadding={20} style={{ parent: { marginBottom: '50px' } }}>
        <VictoryAxis tickValues={monthNames} tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} />
        <VictoryAxis dependentAxis label="Euros" style={{ axisLabel: { padding: 35 } }} />
        <VictoryBar
          data={currentPropertyConsumptions.map(consumption => ({...consumption, month: monthNames[consumption.month - 1]}))}
          x="month"
          y="euros"
        />
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