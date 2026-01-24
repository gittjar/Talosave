import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  ButtonGroup, 
  Alert,
  Badge,
  Spinner,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  Lightning, 
  BarChart, 
  GraphUp,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  CalendarPlus
} from 'react-bootstrap-icons';
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryArea, VictoryScatter } from 'victory';
import config from '../configuration/config';

async function fetchElectricityPrices() {
  try {
    const response = await fetch(`${config.baseURL}/api/nordpool/prices`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch prices');
    }
    
    console.log('Fetched Nord Pool prices:', {
      todayCount: data.today?.length || 0,
      tomorrowCount: data.tomorrow?.length || 0,
      source: data.source
    });
    
    return data;
  } catch (error) {
    console.error('Failed to fetch from backend:', error);
    throw error;
  }
}

const ElectricityPrice = () => {
  const [todayPrices, setTodayPrices] = useState([]);
  const [tomorrowPrices, setTomorrowPrices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area');
  const [activeTab, setActiveTab] = useState('today');
  const [dataSource, setDataSource] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchElectricityPrices();
        
        setTodayPrices(data.today || []);
        setTomorrowPrices(data.tomorrow || []);
        setDataSource(data.source || 'Nord Pool');
        
        console.log('Prices loaded:', {
          today: data.today?.length || 0,
          tomorrow: data.tomorrow?.length || 0
        });
      } catch (e) {
        console.error('Electricity price fetch error:', e);
        setError(`Hinnan haku epäonnistui: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh prices every hour
    const interval = setInterval(fetchPrice, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toDateString();

  const calculateStats = (priceArray) => {
    if (!priceArray || priceArray.length === 0) {
      return { current: 0, min: 0, max: 0, avg: 0, cheapestWindow: 0 };
    }
    
    const priceValues = priceArray.map(p => p.price);
    const currentPrice = priceArray.find(p => {
      const priceDate = new Date(p.time);
      return priceDate.getHours() === currentHour && priceDate.toDateString() === currentDate;
    });
    
    const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    
    // Find cheapest 3-hour window
    let cheapestWindowStart = 0;
    let cheapestWindowSum = Infinity;
    for (let i = 0; i <= priceValues.length - 3; i++) {
      const windowSum = priceValues[i] + priceValues[i + 1] + priceValues[i + 2];
      if (windowSum < cheapestWindowSum) {
        cheapestWindowSum = windowSum;
        cheapestWindowStart = i;
      }
    }
    
    return {
      current: currentPrice?.price || priceValues[currentHour] || 0,
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
      avg: avg,
      cheapestWindow: cheapestWindowStart
    };
  };

  const formatPrices = (priceArray) => {
    return priceArray.map(price => {
      const priceDate = new Date(price.time);
      return {
        x: priceDate,
        y: price.price,
        label: `${price.price.toFixed(2)} c/kWh\n${priceDate.toLocaleString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`,
        isCurrentHour: priceDate.getHours() === currentHour && priceDate.toDateString() === currentDate
      };
    });
  };

  const renderStatsCards = (stats, priceArray) => {
    if (!stats) return null;
    
    const cheapestHour = priceArray[stats.cheapestWindow];
    const cheapestDate = cheapestHour ? new Date(cheapestHour.time) : null;
    
    return (
      <Row className="g-3 mb-4">
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Lightning size={32} className="text-warning mb-2" />
              <h3 className="h2 mb-1 fw-bold">{stats.current.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">c/kWh - Nyt</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <ArrowDown size={32} className="text-success mb-2" />
              <h3 className="h2 mb-1 fw-bold text-success">{stats.min.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">c/kWh - Halvin</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <ArrowUp size={32} className="text-danger mb-2" />
              <h3 className="h2 mb-1 fw-bold text-danger">{stats.max.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">c/kWh - Kallein</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Clock size={32} className="text-info mb-2" />
              <h3 className="h6 mb-1 fw-bold">
                {cheapestDate ? `${cheapestDate.getHours()}:00-${cheapestDate.getHours() + 3}:00` : 'N/A'}
              </h3>
              <p className="text-muted mb-0 small">Halvin 3h jakso</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderChart = (formattedPrices, stats) => {
    console.log('renderChart called with:', { 
      pricesCount: formattedPrices?.length, 
      chartType,
      stats 
    });
    
    if (!formattedPrices || formattedPrices.length === 0) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Ladataan kaaviotietoja...</p>
        </div>
      );
    }

    return (
      <VictoryChart
        containerComponent={<VictoryVoronoiContainer />}
        padding={{ top: 20, bottom: 80, left: 80, right: 50 }}
        height={400}
        style={{
          parent: {
            backgroundColor: '#ffffff'
          }
        }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: '#6c757d' },
            tickLabels: { 
              fill: '#6c757d', 
              fontSize: 12, 
              angle: -45,
              textAnchor: 'end'
            },
            grid: { stroke: '#e9ecef', strokeWidth: 1 },
          }}
          tickFormat={(x) => {
            const date = new Date(x);
            return `${date.getHours().toString().padStart(2, '0')}:00`;
          }}
          tickCount={12}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: '#6c757d' },
            tickLabels: { fill: '#6c757d', fontSize: 12 },
            grid: { stroke: '#e9ecef', strokeWidth: 1 },
            axisLabel: { padding: 50, fontSize: 14, fill: '#495057' }
          }}
          label="Hinta (c/kWh)"
        />
        
        {chartType === 'line' && (
          <VictoryLine
            data={formattedPrices}
            style={{
              data: { 
                stroke: '#0d6efd', 
                strokeWidth: 3,
                strokeLinecap: 'round'
              }
            }}
            labelComponent={<VictoryTooltip 
              style={{ fill: 'white', fontSize: 12 }}
              flyoutStyle={{ fill: '#212529', stroke: '#0d6efd' }}
            />}
          />
        )}
        
        {chartType === 'bar' && (
          <VictoryBar
            data={formattedPrices}
            style={{
              data: {
                fill: ({ datum }) => {
                  if (datum.isCurrentHour) return '#ffc107';
                  if (datum.y > stats.avg * 1.2) return '#dc3545';
                  if (datum.y < stats.avg * 0.8) return '#198754';
                  return '#0d6efd';
                }
              }
            }}
            labelComponent={<VictoryTooltip 
              style={{ fill: 'white', fontSize: 12 }}
              flyoutStyle={{ fill: '#212529' }}
            />}
          />
        )}
        
        {chartType === 'area' && (
          <VictoryArea
            data={formattedPrices}
            style={{
              data: { 
                fill: '#0d6efd', 
                fillOpacity: 0.3,
                stroke: '#0d6efd', 
                strokeWidth: 2
              }
            }}
            labelComponent={<VictoryTooltip 
              style={{ fill: 'white', fontSize: 12 }}
              flyoutStyle={{ fill: '#212529', stroke: '#0d6efd' }}
            />}
          />
        )}
      </VictoryChart>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h2 className="h3 mb-0">
              <Lightning className="me-2 text-warning" />
              Pörssisähkö
            </h2>
          </Col>
        </Row>
        
        <Row>
          <Col className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Ladataan hintatietoja Nord Pool -markkinalta...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  const todayStats = calculateStats(todayPrices);
  const tomorrowStats = calculateStats(tomorrowPrices);

  console.log('Render state:', {
    todayPricesCount: todayPrices.length,
    tomorrowPricesCount: tomorrowPrices.length,
    todayStats,
    activeTab,
    chartType,
    dataSource
  });

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="h3 mb-0">
                <Lightning className="me-2 text-warning" />
                Pörssisähkön hinta
              </h2>
              <small className="text-muted">
                <Clock className="me-1" size={14} />
                Päivitetty: {new Date().toLocaleTimeString('fi-FI')}
              </small>
            </div>
            
            <ButtonGroup>
              <Button 
                variant={chartType === 'area' ? 'primary' : 'outline-primary'}
                onClick={() => setChartType('area')}
                size="sm"
                style={{ padding: '6px', marginRight: '4px' }}
              >
                <Activity className="me-1" />
                Alue
              </Button>
              <Button 
                variant={chartType === 'line' ? 'primary' : 'outline-primary'}
                onClick={() => setChartType('line')}
                size="sm"
                style={{ padding: '6px', marginRight: '4px' }}

              >
                <GraphUp className="me-1" />
                Viiva
              </Button>
              <Button 
                variant={chartType === 'bar' ? 'primary' : 'outline-primary'}
                onClick={() => setChartType('bar')}
                size="sm"
              >
                <BarChart className="me-1" />
                Pylväs
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" className="d-flex align-items-center">
              <Lightning className="me-2" />
              <div>
                <strong>Varoitus:</strong> {error}
                <br />
                <small>Käytetään esimerkki hintatietoja. Todellinen hinta voi poiketa.</small>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Tabs for Today and Tomorrow */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab 
          eventKey="today" 
          title={
            <span>
              <Calendar className="me-2" />
              Tänään
            </span>
          }
        >
          {renderStatsCards(todayStats, todayPrices)}
          
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="mb-0">
                    <Activity className="me-2" />
                    Sähkön hinta tänään (snt/kWh)
                  </h5>
                </Card.Header>
                <Card.Body>
                  {renderChart(formatPrices(todayPrices), todayStats)}
                </Card.Body>
                <Card.Footer className="bg-light text-muted">
                  <small className="d-flex flex-wrap align-items-center gap-2">
                    <span>Värikoodit:</span>
                    <Badge bg="warning">Nykyinen tunti</Badge>
                    <Badge bg="success">Halpa</Badge>
                    <Badge bg="danger">Kallis</Badge>
                    <Badge bg="primary">Normaali</Badge>
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab 
          eventKey="tomorrow" 
          title={
            <span>
              <CalendarPlus className="me-2" />
              Huomenna {tomorrowPrices.length > 0 ? `(${tomorrowPrices.length}h)` : ''}
            </span>
          }
        >
          {tomorrowPrices.length > 0 ? (
            <>
              {renderStatsCards(tomorrowStats, tomorrowPrices)}
              
              <Row>
                <Col>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 py-3">
                      <h5 className="mb-0">
                        <Activity className="me-2" />
                        Sähkön hinta huomenna (snt/kWh)
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      {renderChart(formatPrices(tomorrowPrices), tomorrowStats)}
                    </Card.Body>
                    <Card.Footer className="bg-light text-muted">
                      <small className="d-flex flex-wrap align-items-center gap-2">
                        <span>Värikoodit:</span>
                        <Badge bg="success">Halpa</Badge>
                        <Badge bg="danger">Kallis</Badge>
                        <Badge bg="primary">Normaali</Badge>
                      </small>
                    </Card.Footer>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Row>
              <Col>
                <Alert variant="info" className="d-flex align-items-start">
                  <CalendarPlus size={32} className="me-3 mt-1" />
                  <div>
                    <h6 className="mb-2">Huomisen hinnat eivät ole vielä saatavilla</h6>
                    <p className="mb-2">
                      Seuraavan päivän sähkön hinnat julkaistaan yleensä noin <strong>klo 15:00</strong> iltapäivällä.
                    </p>
                    <small className="text-muted">
                      <Clock className="me-1" size={14} />
                      Nykyinen aika: {new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                </Alert>
              </Col>
            </Row>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ElectricityPrice;
