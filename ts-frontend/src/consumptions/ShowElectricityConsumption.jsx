import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  ButtonGroup, 
  ToggleButton,
  Badge,
  Alert,
  Tabs,
  Tab,
  Form
} from 'react-bootstrap';
import { 
  PlusLg, 
  BarChart, 
  GraphUp,
  Calendar,
  Lightning,
  CurrencyEuro,
  ArrowUpRight,
  Eye,
  EyeSlash,
  ArrowLeft
} from 'react-bootstrap-icons';
import Table from 'react-bootstrap/Table';
import colorMap from '../components/colorMap';
import { toast } from 'react-toastify';
import AddElectricityForm from '../forms/AddElectricityForm';
import DeleteConfirmation from '../notifications/DeleteConfirmation';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel, VictoryTooltip, VictoryGroup, VictoryArea, VictoryLine } from 'victory';
import { useConsumption } from '../hooks/useConsumption.js';
import axios from 'axios';
import config from '../configuration/config';

const ShowElectricityConsumption = () => {
  const { id } = useParams(); // Get the property ID from the URL
  const navigate = useNavigate();
  const [selectedYears, setSelectedYears] = useState([]); 
  const [years, setYears] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'comparison'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'area'
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const { 
    consumptions: electricityConsumptions, 
    loading, 
    fetchConsumptions: fetchElectricityConsumptions,
    addConsumption,
    deleteConsumption
  } = useConsumption('electricity');

  const monthNames = [
    'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
  ];

  const refreshData = async () => {
    await fetchElectricityConsumptions(id);
  };

  useEffect(() => {
    if (id) {
      fetchElectricityConsumptions(id);
    }
  }, [id, fetchElectricityConsumptions]);

  useEffect(() => {
    // Get unique years from the data and sort them
    const uniqueYears = [...new Set(electricityConsumptions.map(item => item.year))].sort((a, b) => b - a);
    setYears(uniqueYears);
    
    // Auto-select most recent year if none selected
    if (uniqueYears.length > 0 && selectedYears.length === 0) {
      setSelectedYears([uniqueYears[0]]);
    }
  }, [electricityConsumptions]);

  const handleYearToggle = (year) => {
    if (viewMode === 'single') {
      setSelectedYears([year]);
    } else {
      // Comparison mode - allow max 2 years
      if (selectedYears.includes(year)) {
        setSelectedYears(selectedYears.filter(y => y !== year));
      } else if (selectedYears.length < 2) {
        setSelectedYears([...selectedYears, year]);
      } else {
        toast.info('Voit vertailla enintään kahta vuotta kerrallaan');
      }
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'single' && selectedYears.length > 1) {
      setSelectedYears([selectedYears[0]]);
    }
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const showDeleteConfirmation = (consumption) => {
    setItemToDelete(consumption);
    setShowDeleteConfirm(true);
  };

  const deleteElectricityConsumption = async () => {
    if (!itemToDelete) return;
    
    const token = localStorage.getItem('userToken');

    try {
      await axios.delete(`${config.baseURL}/api/electricconsumptions/${itemToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Sähködata poistettu!');
      refreshData();
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting electricity consumption:', error);
      toast.error('Sähködataa ei voitu poistaa.');
    }
  };

  // Filter the electricityConsumptions array to only include the records for the current property
  const currentPropertyConsumptions = electricityConsumptions.filter(consumption => 
    consumption.propertyid === Number(id) && selectedYears.includes(consumption.year)
  );

  // Add statistics calculations
  const calculateStats = (consumptions) => {
    if (consumptions.length === 0) return null;
    
    const totals = consumptions.reduce((acc, curr) => ({
      kwh: acc.kwh + curr.kwh,
      euros: acc.euros + curr.euros
    }), { kwh: 0, euros: 0 });
    
    const avgMonthly = {
      kwh: totals.kwh / consumptions.length,
      euros: totals.euros / consumptions.length
    };
    
    const pricePerKwh = totals.euros / totals.kwh;
    
    return { totals, avgMonthly, pricePerKwh, monthCount: consumptions.length };
  };

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
  const stats = calculateStats(currentPropertyConsumptions);

  const handleButtonClick = () => {
    setShowForm(!showForm);
  };

  const renderStatsCards = () => {
    if (!stats) return null;
    
    return (
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <Lightning size={24} className="text-warning mb-2" />
              <Card.Title className="h5">{stats.totals.kwh.toFixed(1)} kWh</Card.Title>
              <Card.Text className="text-muted small">Yhteensä kulutus</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <CurrencyEuro size={24} className="text-success mb-2" />
              <Card.Title className="h5">{stats.totals.euros.toFixed(2)} €</Card.Title>
              <Card.Text className="text-muted small">Yhteensä kustannus</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <ArrowUpRight size={24} className="text-info mb-2" />
              <Card.Title className="h5">{stats.avgMonthly.kwh.toFixed(1)} kWh</Card.Title>
              <Card.Text className="text-muted small">Keskiarvo/kk</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <GraphUp size={24} className="text-primary mb-2" />
              <Card.Title className="h5">{stats.pricePerKwh.toFixed(3)} €/kWh</Card.Title>
              <Card.Text className="text-muted small">Keskihinta</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderYearSelector = () => (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={4}>
            <h6 className="mb-3">
              <Calendar className="me-2" />
              Näkymä
            </h6>
            <ButtonGroup size="sm" className="mb-3">
              <Button 
                variant={viewMode === 'single' ? 'primary' : 'outline-primary'}
                onClick={() => handleViewModeChange('single')}
              >
                <Eye className="me-1" />
                Yksittäinen
              </Button>
              <Button 
                variant={viewMode === 'comparison' ? 'primary' : 'outline-primary'}
                onClick={() => handleViewModeChange('comparison')}
              >
                <EyeSlash className="me-1" />
                Vertailu
              </Button>
            </ButtonGroup>
          </Col>
          
          <Col md={8}>
            <h6 className="mb-3">Valitse vuodet:</h6>
            <div className="d-flex flex-wrap gap-2">
              {years.map(year => (
                <ToggleButton
                  key={year}
                  id={`year-${year}`}
                  type="checkbox"
                  variant={selectedYears.includes(year) ? 'primary' : 'outline-primary'}
                  checked={selectedYears.includes(year)}
                  value={year}
                  onChange={() => handleYearToggle(year)}
                  size="sm"
                  style={{ 
                    backgroundColor: selectedYears.includes(year) ? colorMap.getColor(year) : 'transparent',
                    borderColor: colorMap.getColor(year),
                    color: selectedYears.includes(year) ? 'white' : colorMap.getColor(year)
                  }}
                >
                  {year}
                </ToggleButton>
              ))}
            </div>
            {selectedYears.length === 0 && (
              <Alert variant="info" className="mt-2 mb-0">
                Valitse vähintään yksi vuosi nähdäksesi tiedot
              </Alert>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                onClick={() => navigate(`/consumptions/${id}`)}
                className="me-3 d-flex align-items-center"
                size="sm"
              >
                <ArrowLeft className="me-1" />
                Takaisin kulutuksiin
              </Button>
              <h2 className="h3 mb-0">
                <Lightning className="me-2 text-warning" />
                Sähkönkulutus
              </h2>
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Ladataan...</span>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (years.length === 0) {
    return (
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                onClick={() => navigate(`/consumptions/${id}`)}
                className="me-3 d-flex align-items-center"
                size="sm"
              >
                <ArrowLeft className="me-1" />
                Takaisin kulutuksiin
              </Button>
              <h2 className="h3 mb-0">
                <Lightning className="me-2 text-warning" />
                Sähkönkulutus
              </h2>
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <Alert variant="info" className="text-center">
              <h4 className="alert-heading">Ei sähködataa</h4>
              <p>Lisää ensimmäinen sähkönkulutustietue painamalla "Lisää sähködataa" -nappia.</p>
            </Alert>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <AddElectricityForm propertyId={id} refreshData={refreshData} closeForm={closeForm} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                onClick={() => navigate(`/consumptions/${id}`)}
                className="me-3 d-flex align-items-center"
                size="sm"
              >
                <ArrowLeft className="me-1" />
                Takaisin kulutuksiin
              </Button>
              <h2 className="h3 mb-0">
                <Lightning className="me-2 text-warning" />
                Sähkönkulutus
              </h2>
            </div>
            <Button 
              variant={showForm ? "outline-secondary" : "primary"}
              onClick={handleButtonClick}
              className="d-flex align-items-center"
            >
              <PlusLg className="me-2" />
              {showForm ? 'Sulje lomake' : 'Lisää sähködataa'}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Add form */}
      {showForm && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <AddElectricityForm propertyId={id} refreshData={refreshData} closeForm={() => setShowForm(false)} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Year selector */}
      {renderYearSelector()}

      {/* Statistics cards */}
      {selectedYears.length > 0 && renderStatsCards()}

      {/* Content tabs */}
      {selectedYears.length > 0 && (
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
          <Tab eventKey="overview" title={<><BarChart className="me-2" />Yleiskatsaus</>}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <VictoryChart 
                  domainPadding={30} 
                  padding={{ top: 20, bottom: 80, left: 100, right: 100 }}
                  style={{ parent: { marginBottom: '50px' } }}
                  width={850}
                >
                  <VictoryAxis 
                    tickValues={monthNames} 
                    tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} 
                  />
                  <VictoryAxis dependentAxis label="kWh" style={{ axisLabel: { padding: 35 } }} />
                  <VictoryGroup offset={25}> 
                    {[...selectedYears].reverse().map(year => (
                      <VictoryBar
                        key={year}
                        barWidth={25}
                        data={currentPropertyConsumptions
                          .filter(consumption => consumption.year === year)
                          .map(consumption => ({
                            ...consumption, 
                            month: monthNames[consumption.month - 1]
                          }))}
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
                  width={550}
                >
                  <VictoryAxis 
                    tickValues={monthNames} 
                    tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" verticalAnchor="middle" />} 
                  />
                  <VictoryAxis dependentAxis label="Euros" style={{ axisLabel: { padding: 35 } }} />
                  {selectedYears.map(year => (
                    <VictoryArea
                      key={year}
                      data={currentPropertyConsumptions
                        .filter(consumption => consumption.year === year)
                        .map(consumption => ({
                          ...consumption, 
                          month: monthNames[consumption.month - 1]
                        }))}
                      x="month"
                      y="euros"
                      style={{ data: { fill: colorMap.getColor(year), stroke: colorMap.getColor(year) } }}
                    />
                  ))}
                </VictoryChart>
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="details" title={<><Calendar className="me-2" />Kuukausittain</>}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Vuosi</th>
                      <th>Kuukausi</th>
                      <th>kWh</th>
                      <th>Euros</th>
                      <th>Toiminnot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPropertyConsumptions.map((consumption, index) => (
                      <tr key={index}>
                        <td>
                          <Badge 
                            style={{ backgroundColor: colorMap.getColor(consumption.year) }}
                            className="text-white"
                          >
                            {consumption.year}
                          </Badge>
                        </td>
                        <td>{monthNames[consumption.month - 1]}</td>
                        <td>{consumption.kwh.toFixed(2)} kWh</td>
                        <td>{consumption.euros.toFixed(2)} €</td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => showDeleteConfirmation(consumption)}
                          >
                            Poista
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {Object.entries(totals).map(([year, total]) => (
                      <tr key={`total-${year}`} className="table-info fw-bold">
                        <td>
                          <Badge 
                            style={{ backgroundColor: colorMap.getColor(parseInt(year)) }}
                            className="text-white"
                          >
                            {year}
                          </Badge>
                        </td>
                        <td>Yhteensä</td>
                        <td>{total.kwh.toFixed(2)} kWh</td>
                        <td>{total.euros.toFixed(2)} €</td>
                        <td>-</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
          
          {viewMode === 'comparison' && selectedYears.length === 2 && (
            <Tab eventKey="comparison" title={<><GraphUp className="me-2" />Vertailu</>}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5>Vuosien {selectedYears[0]} ja {selectedYears[1]} vertailu</h5>
                  <div className="text-center py-4">
                    <p className="text-muted">Vertailukaavio tulossa...</p>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          )}
        </Tabs>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <DeleteConfirmation 
          handleDeleteProperty={deleteElectricityConsumption}
          setShowDeleteConfirm={setShowDeleteConfirm}
          fileName={`Sähködata: ${monthNames[itemToDelete.month - 1]} ${itemToDelete.year} (${itemToDelete.kwh} kWh)`}
        />
      )}
    </Container>
  );
};

export default ShowElectricityConsumption;