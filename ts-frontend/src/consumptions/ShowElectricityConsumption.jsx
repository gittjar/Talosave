import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import colorMap from '../components/colorMap';
import { toast } from 'react-toastify';
import { PlusLg } from 'react-bootstrap-icons';
import AddElectricityForm from '../forms/AddElectricityForm';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel, VictoryTooltip, VictoryGroup, VictoryArea } from 'victory';

const ShowElectricityConsumption = () => {
  const { id } = useParams(); // Get the property ID from the URL
  const [electricityConsumptions, setElectricityConsumptions] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchElectricityConsumptions = async () => {
    const token = localStorage.getItem('userToken'); 

    try {
      const response = await axios.get(`${config.baseURL}/api/electricconsumptions/${id}`, {
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

  const refreshData = async () => {
    await fetchElectricityConsumptions();
  };

  useEffect(() => {
    fetchElectricityConsumptions();
  }, [id]);

  const closeForm = () => {
    setShowForm(false);
  };

  

  useEffect(() => {
    const fetchElectricityConsumptions = async () => {
      const token = localStorage.getItem('userToken'); 
  
      try {
        const response = await axios.get(`${config.baseURL}/api/electricconsumptions/${id}`, {
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
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else if (selectedYears.length < 2) {
      setSelectedYears([...selectedYears, year]);
    } else {
      toast.error('Voit vertailla kahta eri vuotta kerrallaan!');
    }
  };
  
  // Filter the electricityConsumptions array to only include the records for the current property
  const currentPropertyConsumptions = electricityConsumptions.filter(consumption => 
    consumption.propertyid === Number(id) && selectedYears.includes(consumption.year)
  );

  if (loading) {
    return <div>Ladataan...</div>;
  }

if (years.length === 0) {
    return <div>Ei kulutusdataa saatavilla.</div>;
  }

  /* RANDOM COLOR GENERATOR */
  /*
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };*/

  

  const monthNames = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];
  
 
  /* KWH table totals*/
  const calculateTotals = (consumptions) => {
    return consumptions.reduce((totals, consumption) => {
      if (!totals[consumption.year]) {
        totals[consumption.year] = { kwh: 0, euros: 0 };
      }
  
      totals[consumption.year].kwh += consumption.kwh;
      totals[consumption.year].euros += consumption.euros;
  
      return totals;
    }, {});
  };

  const totals = calculateTotals(currentPropertyConsumptions);

  const handleButtonClick = () => {
    setShowForm(!showForm);
  };


  


  return (
    <div>
      <section className='electricity-head'>
    <h3>Sähkönkulutus</h3>
    <button className="edit-link" onClick={handleButtonClick}>
    <PlusLg></PlusLg> {showForm ? 'Sulje' : 'Lisää sähködataa'}
      </button>
      {showForm && <AddElectricityForm propertyId={id} refreshData={refreshData} closeForm={closeForm} />}    </section>
    <div>

<div className='kwh-labels-year'>

  {years.map(year => (
    <article key={year} style={{ backgroundColor: colorMap.getColor(year), padding: '5px', margin: '5px' }} className='kwh-box'>
    <input
        type="checkbox"
        value={year}
        checked={selectedYears.includes(year)}
        onChange={handleYearChange}
        className="year-checkbox"
      />
      {year}
    </article>
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

<Table striped bordered hover size="sm">
    <thead>
      <tr>
        <th>Year</th>
        <th>Month</th>
        <th>kWh</th>
        <th>Euros</th>
      </tr>
    </thead>
    <tbody>
      {currentPropertyConsumptions.map((consumption, index) => (
        <tr key={index}>
          <td>{consumption.year}</td>
          <td>{consumption.month}</td>
          <td>{consumption.kwh.toFixed(2)}</td>
          <td>{consumption.euros.toFixed(2)}</td>
        </tr>
      ))}
      {Object.entries(totals).map(([year, total]) => (
        <tr key={year}>
          <td>{year}</td>
          <td>Total</td>
          <td>{total.kwh.toFixed(2)}</td>
          <td>{total.euros.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </Table>
    </div>
  );
};

export default ShowElectricityConsumption;