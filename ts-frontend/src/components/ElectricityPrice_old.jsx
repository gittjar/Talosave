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
  Tab,
  Tabs
} from 'react-bootstrap';
import { 
  Lightning, 
  BarChart, 
  GraphUp, 
  ArrowLeft,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  CalendarPlus
} from 'react-bootstrap-icons';
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryArea, VictoryScatter } from 'victory';

// Using Finnish electricity price API (Nordpool/Entso-e alternative)
const ELECTRICITY_API_URL = 'https://api.porssisahko.net/v1/latest-prices.json';

async function fetchLatestPriceData() {
  try {
    const response = await fetch(ELECTRICITY_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON, got ${contentType}. Response: ${text.substring(0, 100)}...`);
    }
    
    return response.json();
  } catch (error) {
    console.warn('External API failed, using mock data:', error);
    return {
      prices: generateMockPriceData()
    };
  }
}

// Generate mock electricity price data for fallback (48 hours)
function generateMockPriceData() {
  const now = new Date();
  const prices = [];
  
  // Generate 48 hours (today + tomorrow)
  for (let i = 0; i < 48; i++) {
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + i);
    const basePrice = 12;
    const hourOfDay = startDate.getHours();
    const variation = Math.sin(hourOfDay * Math.PI / 12) * 8;
    const randomVariation = (Math.random() - 0.5) * 4;
    const price = Math.max(5, Math.round((basePrice + variation + randomVariation) * 100) / 100);
    
    prices.push({
      startDate: startDate.toISOString(),
      price: price
    });
  }
  
  return prices;
}

const ElectricityPrice = () => {
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area');
  const [activeTab, setActiveTab] = useState('today');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLatestPriceData();
        
        const pricesArray = data.prices || data || [];
        
        if (!Array.isArray(pricesArray) || pricesArray.length === 0) {
          throw new Error('Sähkön hintatiedot eivät ole saatavilla');
        }
        
        setPrices(pricesArray);
      } catch (e) {
        console.error('Electricity price fetch error:', e);
        setError(`Hinnan haku epäonnistui: ${e.message}`);
        setPrices(generateMockPriceData());
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  // Separate prices into today and tomorrow
  const getTodayPrices = () => {
    const today = new Date().toDateString();
    return prices.filter(p => new Date(p.startDate).toDateString() === today);
  };

  const getTomorrowPrices = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();
    return prices.filter(p => new Date(p.startDate).toDateString() === tomorrowStr);
  };

  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toDateString();

  // Calculate statistics for given price array
  const calculateStats = (priceArray) => {
    if (priceArray.length === 0) return null;
    
    const priceValues = priceArray.map(p => p.price);
    const currentPrice = priceArray.find(p => {
      const priceDate = new Date(p.startDate);
      return priceDate.getHours() === currentHour && priceDate.toDateString() === currentDate;
    });
    
    const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    const sortedPrices = [...priceValues].sort((a, b) => a - b);
    
    // Find cheapest 3-hour window
    let cheapestWindowStart = 0;
    let cheapestWindowSum = Infinity;
    for (let i = 0; i <= priceValues.length - 3; i++) {
      const sum = priceValues[i] + priceValues[i + 1] + priceValues[i + 2];
      if (sum < cheapestWindowSum) {
        cheapestWindowSum = sum;
        cheapestWindowStart = i;
      }
    }
    
    return {
      current: currentPrice?.price || priceValues[currentHour] || 0,
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
      avg: avg,
      median: sortedPrices[Math.floor(sortedPrices.length / 2)],
      cheapestWindow: cheapestWindowStart,
      trend: priceValues[priceValues.length - 1] > priceValues[0] ? 'up' : 'down'
    };
  };

  const formatPrices = (priceArray) => {
    return priceArray.map(price => {
      const priceDate = new Date(price.startDate);
      return {
        x: priceDate,
        y: price.price,
        label: `${price.price.toFixed(2)} snt/kWh\n${priceDate.toLocaleString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`,
        isCurrentHour: priceDate.getHours() === currentHour && priceDate.toDateString() === currentDate
      };
    });
  };

  const renderStatsCards = (stats, priceArray) => {
    if (!stats) return null;
    
    const cheapestHour = priceArray[stats.cheapestWindow];
    const cheapestDate = cheapestHour ? new Date(cheapestHour.startDate) : null;
    
    return (
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm hover-shadow">
            <Card.Body className="text-center">
              <Lightning size={32} className="text-warning mb-2" />
              <h3 className="h2 mb-1 fw-bold">{stats.current.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">snt/kWh - Nyt</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm hover-shadow">
            <Card.Body className="text-center">
              <ArrowDown size={32} className="text-success mb-2" />
              <h3 className="h2 mb-1 fw-bold text-success">{stats.min.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">snt/kWh - Halvin</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm hover-shadow">
            <Card.Body className="text-center">
              <ArrowUp size={32} className="text-danger mb-2" />
              <h3 className="h2 mb-1 fw-bold text-danger">{stats.max.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">snt/kWh - Kallein</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm hover-shadow">
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

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/home')}
                className="me-3 d-flex align-items-center"
                size="sm"
              >
                <ArrowLeft className="me-1" />
                Takaisin
              </Button>
              <h2 className="h3 mb-0">
                <Lightning className="me-2 text-warning" />
                Sähkön hinta
              </h2>
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Ladataan hintatietoja...</p>
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
                onClick={() => navigate('/home')}
                className="me-3 d-flex align-items-center"
                size="sm"
              >
                <ArrowLeft className="me-1" />
                Takaisin
              </Button>
              <h2 className="h3 mb-0">
                <Lightning className="me-2 text-warning" />
                Sähkön hinta
              </h2>
            </div>
            
            <div className="d-flex align-items-center">
              <Clock className="me-2 text-muted" />
              <Badge bg="info" className="me-3">
                Päivitetty: {new Date().toLocaleTimeString()}
              </Badge>
              <ButtonGroup size="sm">
                <Button 
                  variant={chartType === 'line' ? 'primary' : 'outline-primary'}
                  onClick={() => setChartType('line')}
                >
                  <GraphUp className="me-1" />
                  Viiva
                </Button>
                <Button 
                  variant={chartType === 'bar' ? 'primary' : 'outline-primary'}
                  onClick={() => setChartType('bar')}
                >
                  <BarChart className="me-1" />
                  Pylväs
                </Button>
                <Button 
                  variant={chartType === 'area' ? 'primary' : 'outline-primary'}
                  onClick={() => setChartType('area')}
                >
                  <Activity className="me-1" />
                  Alue
                </Button>
              </ButtonGroup>
            </div>
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

      {/* Statistics Cards */}
      {renderStatsCards()}

      {/* Price Chart */}
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
              {formattedPrices.length > 0 ? (
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
                    label="Hinta (snt/kWh)"
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
              ) : (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Ladataan kaaviotietoja...</p>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="bg-light text-muted">
              <small>
                Hinnat päivittyvät tunnin välein. Värikoodit: 
                <Badge bg="warning" className="mx-1">Nykyinen tunti</Badge>
                <Badge bg="success" className="mx-1">Halpa (&lt;80% keskiarvosta)</Badge>
                <Badge bg="danger" className="mx-1">Kallis (&gt;120% keskiarvosta)</Badge>
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ElectricityPrice;