
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Card, Row, Col, Badge, ButtonGroup, Button } from 'react-bootstrap';
import config from '../configuration/config';
import AddHeatingForm from '../forms/AddHeatingForm';
import colorMap from '../components/colorMap';
import { PlusLg, BarChart, GraphUp, Activity, ArrowUp, ArrowDown } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import DeleteConfirmationHeating from '../notifications/DeleteConfirmationHeating';
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryBar,
  VictoryArea,
  VictoryAxis, 
  VictoryLabel, 
  VictoryTooltip,
  VictoryVoronoiContainer 
} from 'victory';



const ShowHeatingConsumption = () => {

    const { id } = useParams(); // Get the property ID from the URL
    const [heatingConsumptions, setHeatingConsumptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedYears, setSelectedYears] = useState([]); // For chart comparison
    const [unit, setUnit] = useState('kwh'); // Add this state variable
    const [chartType, setChartType] = useState('line'); // Add chart type state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'desc' });
    
    // Checkboxes for data columns to show
    const [visibleColumns, setVisibleColumns] = useState({
      month: true,
      year: true,
      kwh: true,
      mwh: true,
      m3: true,
      liters: true,
      euros: true
    });

    
    const fetchHeatingConsumptions = async (propertyId) => {
        const token = localStorage.getItem('userToken'); 
        //  Get the token from local storage
        //
        //  console.log('Token:', token); // Log the token
        //
        //
        //
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

      const deleteHeatingConsumption = async (propertyId, month, year) => {
        const token = localStorage.getItem('userToken'); // Get the token from local storage
      
        try {
          const response = await fetch(`${config.baseURL}/api/heatingconsumptions/`, {
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
      
          console.log('Heating data deleted successfully.');
          toast.dark('Tietue poistettu onnistuneesti.'); // Show a success toast
          refreshData(); // Refresh the data after deleting
        } catch (error) {
          console.error('Error deleting heating consumption:', error);
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

    // Calculate statistics for selected years
    const calculateYearStats = (year) => {
      const yearData = heatingConsumptions.filter(item => item.year === year && item[unit]);
      if (yearData.length === 0) return null;
      
      const values = yearData.map(item => item[unit]);
      const total = values.reduce((sum, val) => sum + val, 0);
      const avg = total / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const totalEuros = yearData.reduce((sum, item) => sum + (item.euros || 0), 0);
      
      return { total, avg, max, min, totalEuros, count: yearData.length };
    };

    // Get chart data
    const getChartData = (year) => {
      return heatingConsumptions
        .filter(consumption => consumption.year === year && consumption[unit] != null && consumption[unit] > 0)
        .map(consumption => ({
          ...consumption,
          month: monthNames[consumption.month - 1]
        }));
    };

    // Format number with proper decimals
    const formatValue = (value, decimals = 1) => {
      if (value === null || value === undefined || value === 0) return '-';
      return Number(value).toFixed(decimals);
    };

    // Sort function
    const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    // Get sorted data
    const getSortedData = () => {
      const sorted = [...heatingConsumptions].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle month sorting specially (convert to number)
        if (sortConfig.key === 'month') {
          aVal = a.month;
          bVal = b.month;
        }

        if (aVal == null) aVal = 0;
        if (bVal == null) bVal = 0;

        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      return sorted;
    };

    const sortedData = getSortedData();



    return (
        <div>

            <h3>Lämmityskulut</h3>
            {loading && <p>Loading data...</p>}
            <button onClick={() => setShowForm(prevShowForm => !prevShowForm)} className='edit-link'>
                   
            {showForm ? 'Sulje lämmityskulutuksen lisäys' :  <><PlusLg /> Lisää lämmityskulutus</>}                </button>  

                {showForm && <AddHeatingForm propertyId={id} refreshData={refreshData} />} 

            {/* Year Selection for Chart Comparison */}
            {years.length > 0 && (
              <div className="my-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                <label className="d-block mb-2 fw-bold">Valitse vuodet vertailuun:</label>
                <div className="d-flex flex-wrap gap-2">
                  {years.map(year => (
                    <div key={year} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`year-${year}`}
                        value={year}
                        checked={selectedYears.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedYears(prev => [...prev, year]);
                          } else {
                            setSelectedYears(prev => prev.filter(y => y !== year));
                          }
                        }}
                      />
                      <label 
                        className="form-check-label fw-bold" 
                        htmlFor={`year-${year}`}
                        style={{ color: colorMap.getColor(year) }}
                      >
                        {year}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Year Summary Cards - Show All Years */}
            {years.length > 0 && (
              <Row className="my-4 g-3">
                {years.map(year => {
                  const stats = calculateYearStats(year);
                  if (!stats) return null;
                  
                  return (
                    <Col key={year} xs={12} sm={6} md={4} lg={3}>
                      <Card 
                        className="h-100" 
                        style={{ 
                          borderLeft: `5px solid ${colorMap.getColor(year)}`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0" style={{ color: colorMap.getColor(year) }}>{year}</h5>
                            <Badge bg="secondary" pill>{stats.count} kk</Badge>
                          </div>
                          <div style={{ fontSize: '0.9rem' }}>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Yhteensä:</span>
                              <strong>{formatValue(stats.total, 0)} {unit}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Keskiarvo:</span>
                              <span>{formatValue(stats.avg)} {unit}/kk</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Min:</span>
                              <span>{formatValue(stats.min)} {unit}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Max:</span>
                              <span>{formatValue(stats.max)} {unit}</span>
                            </div>
                            <div className="d-flex justify-content-between border-top mt-2 pt-2">
                              <span className="text-muted">Kulut:</span>
                              <strong className="text-success">{formatValue(stats.totalEuros, 2)} €</strong>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}


<section className=''>
<article className='m-4'>

            </article>


            <article className='p-2 border border-secondary rounded-lg'>
            <h5>Lämmityskulut vuosittain</h5>
            
            {/* Unit Selection and Chart Type */}
            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
              <div>
                <label className="d-block mb-2 fw-bold">Yksikkö:</label>
                <ButtonGroup size="sm">
                  <Button 
                    variant={unit === 'kwh' ? 'primary' : 'outline-primary'}
                    onClick={() => setUnit('kwh')}
                  >
                    kWh
                  </Button>
                  <Button 
                    variant={unit === 'mwh' ? 'primary' : 'outline-primary'}
                    onClick={() => setUnit('mwh')}
                  >
                    MWh
                  </Button>
                  <Button 
                    variant={unit === 'm3' ? 'primary' : 'outline-primary'}
                    onClick={() => setUnit('m3')}
                  >
                    M³
                  </Button>
                  <Button 
                    variant={unit === 'liters' ? 'primary' : 'outline-primary'}
                    onClick={() => setUnit('liters')}
                  >
                    Liters
                  </Button>
                </ButtonGroup>
              </div>

              <div>
                <label className="d-block mb-2 fw-bold">Kaavion tyyppi:</label>
                <ButtonGroup size="sm">
                  <Button 
                    variant={chartType === 'line' ? 'secondary' : 'outline-secondary'}
                    onClick={() => setChartType('line')}
                    title="Viiva"
                  >
                    <GraphUp />
                  </Button>
                  <Button 
                    variant={chartType === 'area' ? 'secondary' : 'outline-secondary'}
                    onClick={() => setChartType('area')}
                    title="Alue"
                  >
                    <Activity />
                  </Button>
                  <Button 
                    variant={chartType === 'bar' ? 'secondary' : 'outline-secondary'}
                    onClick={() => setChartType('bar')}
                    title="Palkki"
                  >
                    <BarChart />
                  </Button>
                </ButtonGroup>
              </div>
            </div>
    
            {/* Chart */}
            {selectedYears.length > 0 && (
              <VictoryChart 
                domainPadding={30} 
                padding={{ top: 20, bottom: 80, left: 100, right: 100 }}
                width={850}
                height={400}
                containerComponent={<VictoryVoronoiContainer />}
              >
                <VictoryAxis 
                  tickValues={monthNames} 
                  tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} 
                  style={{
                    tickLabels: { fontSize: 10 }
                  }}
                />
                <VictoryAxis 
                  dependentAxis 
                  label={unit} 
                  style={{ 
                    axisLabel: { padding: 55, fontSize: 12 },
                    tickLabels: { fontSize: 10 }
                  }} 
                />
                {selectedYears.map((year, index) => {
                  const data = getChartData(year);
                  if (data.length === 0) return null; // Skip if no data
                  
                  const color = colorMap.getColor(year);
                  
                  if (chartType === 'line') {
                    return (
                      <VictoryLine
                        key={year}
                        data={data}
                        x="month"
                        y={unit}
                        style={{ 
                          data: { 
                            stroke: color,
                            strokeWidth: 2
                          } 
                        }}
                        labelComponent={<VictoryTooltip />}
                        labels={({ datum }) => `${year}\n${datum[unit]?.toFixed(1)} ${unit}\n${datum.euros?.toFixed(2)} €`}
                      />
                    );
                  } else if (chartType === 'area') {
                    return (
                      <VictoryArea
                        key={year}
                        data={data}
                        x="month"
                        y={unit}
                        style={{ 
                          data: { 
                            fill: color,
                            fillOpacity: 0.3,
                            stroke: color,
                            strokeWidth: 2
                          } 
                        }}
                        labelComponent={<VictoryTooltip />}
                        labels={({ datum }) => `${year}\n${datum[unit]?.toFixed(1)} ${unit}\n${datum.euros?.toFixed(2)} €`}
                      />
                    );
                  } else {
                    return (
                      <VictoryBar
                        key={year}
                        data={data}
                        x="month"
                        y={unit}
                        barWidth={15}
                        style={{ 
                          data: { 
                            fill: color,
                            fillOpacity: 0.8
                          } 
                        }}
                        labelComponent={<VictoryTooltip />}
                        labels={({ datum }) => `${year}\n${datum[unit]?.toFixed(1)} ${unit}\n${datum.euros?.toFixed(2)} €`}
                      />
                    );
                  }
                })}
              </VictoryChart>
            )}
            
            {selectedYears.length === 0 && (
              <div className="text-center text-muted py-5">
                <Activity size={48} className="mb-3 opacity-50" />
                <p>Valitse vuosia ylhäältä nähdäksesi vertailun kaaviossa</p>
              </div>
            )}
    </article>

    {/* Table Column Visibility Filters - Above Table */}
    <div className="my-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
      <label className="d-block mb-2 fw-bold">Näytä taulukossa:</label>
      <div className="d-flex flex-wrap gap-3">
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="col-kwh"
            checked={visibleColumns.kwh}
            onChange={(e) => setVisibleColumns({...visibleColumns, kwh: e.target.checked})}
          />
          <label className="form-check-label" htmlFor="col-kwh">kWh</label>
        </div>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="col-mwh"
            checked={visibleColumns.mwh}
            onChange={(e) => setVisibleColumns({...visibleColumns, mwh: e.target.checked})}
          />
          <label className="form-check-label" htmlFor="col-mwh">MWh</label>
        </div>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="col-m3"
            checked={visibleColumns.m3}
            onChange={(e) => setVisibleColumns({...visibleColumns, m3: e.target.checked})}
          />
          <label className="form-check-label" htmlFor="col-m3">M³</label>
        </div>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="col-liters"
            checked={visibleColumns.liters}
            onChange={(e) => setVisibleColumns({...visibleColumns, liters: e.target.checked})}
          />
          <label className="form-check-label" htmlFor="col-liters">Liters</label>
        </div>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="col-euros"
            checked={visibleColumns.euros}
            onChange={(e) => setVisibleColumns({...visibleColumns, euros: e.target.checked})}
          />
          <label className="form-check-label" htmlFor="col-euros">Euros</label>
        </div>
      </div>
    </div>

    <Table striped bordered hover responsive className="mt-4">
                <thead>
                    <tr>
                        {visibleColumns.month && (
                          <th onClick={() => handleSort('month')} style={{ cursor: 'pointer' }}>
                            Kuukausi {sortConfig.key === 'month' && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </th>
                        )}
                        {visibleColumns.year && (
                          <th onClick={() => handleSort('year')} style={{ cursor: 'pointer' }}>
                            Vuosi {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </th>
                        )}
                        {visibleColumns.kwh && (
                          <th onClick={() => handleSort('kwh')} style={{ cursor: 'pointer' }}>
                            kWh {sortConfig.key === 'kwh' && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </th>
                        )}
                        {visibleColumns.mwh && (
                          <th onClick={() => handleSort('mwh')} style={{ cursor: 'pointer' }}>
                            MWh {sortConfig.key === 'mwh' && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </th>
                        )}
                        {visibleColumns.m3 && (
                          <th onClick={() => handleSort('m3')} style={{ cursor: 'pointer' }}>
                            M³ {sortConfig.key === 'm3' && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </th>
                        )}
                        {visibleColumns.liters && (
                          <th onClick={() => handleSort('liters')} style={{ cursor: 'pointer' }}>
                            Liters {sortConfig.key === 'liters' && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </th>
                        )}
                        {visibleColumns.euros && (
                          <th onClick={() => handleSort('euros')} style={{ cursor: 'pointer' }}>
                            Euros {sortConfig.key === 'euros' && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                          </th>
                        )}
                        <th>Toiminnot</th>

                    </tr>
                </thead>
                <tbody>
  {sortedData.map((item, index) => (
    <tr key={index} style={{
      borderLeft: `5px solid ${colorMap.getColor(item.year)}`,
      backgroundColor: `${colorMap.getColor(item.year)}15` // 15 is hex for ~8% opacity
    }}>
      {visibleColumns.month && <td><strong>{item.month}</strong></td>}
      {visibleColumns.year && <td><Badge style={{ backgroundColor: colorMap.getColor(item.year) }}>{item.year}</Badge></td>}
      {visibleColumns.kwh && <td>{formatValue(item.kwh)}</td>}
      {visibleColumns.mwh && <td>{formatValue(item.mwh, 2)}</td>}
      {visibleColumns.m3 && <td>{formatValue(item.m3)}</td>}
      {visibleColumns.liters && <td>{formatValue(item.liters)}</td>}
      {visibleColumns.euros && <td><strong>{formatValue(item.euros, 2)} €</strong></td>}
      <td>

      <button
  className="delete-link"
  onClick={() => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  }}
>
  Poista
</button>


{showDeleteConfirm && 
  <DeleteConfirmationHeating 
    handleDeleteProperty={() => deleteHeatingConsumption(deletingItem.propertyid, deletingItem.month, deletingItem.year)} 
    setShowDeleteConfirm={setShowDeleteConfirm} 
    deletingItem={deletingItem}
  />
}
      </td>

    </tr>
  ))}
</tbody>
            </Table>
            
</section>
        </div>
    );

};

export default ShowHeatingConsumption;