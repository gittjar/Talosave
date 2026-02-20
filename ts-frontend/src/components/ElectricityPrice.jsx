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
  Tab,
  Table
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
  CalendarPlus,
  ListUl
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
  const [activeTab, setActiveTab] = useState('list');
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
      return { current: 0, min: 0, max: 0, avg: 0, cheapestWindow: 0, minHour: null, maxHour: null };
    }
    
    const priceValues = priceArray.map(p => p.price);
    const currentPrice = priceArray.find(p => {
      const priceDate = new Date(p.time);
      return priceDate.getHours() === currentHour && priceDate.toDateString() === currentDate;
    });
    
    const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    
    // Find min and max hour
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const minHourIndex = priceValues.indexOf(minPrice);
    const maxHourIndex = priceValues.indexOf(maxPrice);
    const minHour = priceArray[minHourIndex] ? new Date(priceArray[minHourIndex].time) : null;
    const maxHour = priceArray[maxHourIndex] ? new Date(priceArray[maxHourIndex].time) : null;
    
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
    
    // Calculate average price for the cheapest 3-hour window
    const cheapestWindowAvg = cheapestWindowSum / 3;
    
    return {
      current: currentPrice?.price || priceValues[currentHour] || 0,
      min: minPrice,
      max: maxPrice,
      avg: avg,
      cheapestWindow: cheapestWindowStart,
      cheapestWindowAvg: cheapestWindowAvg,
      minHour: minHour,
      maxHour: maxHour
    };
  };

  const getPriceColor = (price) => {
    if (price >= 50) return { bg: '#dc3545', text: 'white' }; // Punainen
    if (price >= 30) return { bg: '#fd7e14', text: 'white' }; // Oranssi
    if (price >= 20) return { bg: '#ffc107', text: 'black' }; // Keltainen
    if (price >= 10) return { bg: '#0dcaf0', text: 'black' }; // Sininen
    return { bg: '#198754', text: 'white' }; // Vihreä
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

  const renderStatsCards = (stats, priceArray, isToday = true) => {
    if (!stats) return null;
    
    const cheapestHour = priceArray[stats.cheapestWindow];
    const cheapestDate = cheapestHour ? new Date(cheapestHour.time) : null;
    
    // Get current hour label
    const currentHourLabel = isToday ? "Nyt" : `Huomenna klo ${currentHour.toString().padStart(2, '0')}:00`;
    
    return (
      <Row className="g-3 mb-4">
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Lightning size={32} className="text-warning mb-2" />
              <h3 className="h2 mb-1 fw-bold">{stats.current.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">c/kWh - {currentHourLabel}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <ArrowDown size={32} className="text-success mb-2" />
              <h3 className="h2 mb-1 fw-bold text-success">{stats.min.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">c/kWh - Halvin</p>
              {stats.minHour && (
                <small className="text-success fw-bold">
                  klo {stats.minHour.getHours().toString().padStart(2, '0')}:00
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <ArrowUp size={32} className="text-danger mb-2" />
              <h3 className="h2 mb-1 fw-bold text-danger">{stats.max.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">c/kWh - Kallein</p>
              {stats.maxHour && (
                <small className="text-danger fw-bold">
                  klo {stats.maxHour.getHours().toString().padStart(2, '0')}:00
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={3} md={3} sm={6} xs={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Clock size={32} className="text-info mb-2" />
              <h3 className="h2 mb-1 fw-bold text-info">{stats.cheapestWindowAvg.toFixed(2)}</h3>
              <p className="text-muted mb-0 small">c/kWh - Halvin 3h</p>
              {cheapestDate && (
                <small className="text-info fw-bold">
                  {cheapestDate.getHours().toString().padStart(2, '0')}:00-{(cheapestDate.getHours() + 3).toString().padStart(2, '0')}:00
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderPriceList = (priceArray, isToday = true, stats = null) => {
    if (!priceArray || priceArray.length === 0) {
      return (
        <Alert variant="info">
          <Clock className="me-2" />
          Hintoja ei ole saatavilla
        </Alert>
      );
    }

    // Laske halvin 3h jakso
    const priceValues = priceArray.map(p => p.price);
    let cheapestWindowStart = 0;
    let cheapestWindowSum = Infinity;
    for (let i = 0; i <= priceValues.length - 3; i++) {
      const windowSum = priceValues[i] + priceValues[i + 1] + priceValues[i + 2];
      if (windowSum < cheapestWindowSum) {
        cheapestWindowSum = windowSum;
        cheapestWindowStart = i;
      }
    }

    // Laske kallein 3h jakso
    let expensiveWindowStart = 0;
    let expensiveWindowSum = -Infinity;
    for (let i = 0; i <= priceValues.length - 3; i++) {
      const windowSum = priceValues[i] + priceValues[i + 1] + priceValues[i + 2];
      if (windowSum > expensiveWindowSum) {
        expensiveWindowSum = windowSum;
        expensiveWindowStart = i;
      }
    }

    const avgPrice = stats?.avg || (priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length);
    const dateStr = isToday 
      ? new Date().toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })
      : new Date(Date.now() + 86400000).toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });

    return (
      <div style={{ position: 'relative' }}>
        {/* Sticky header */}
        <div 
          style={{ 
            position: 'sticky', 
            top: '56px', 
            zIndex: 10, 
            backgroundColor: 'white',
            padding: '1rem',
            borderBottom: '2px solid #dee2e6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '0'
          }}
        >
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              📅 {dateStr}
            </div>
            <div style={{ fontSize: '1rem', color: '#6c757d' }}>
              Keskihinta: <span style={{ fontWeight: 'bold', color: '#0d6efd' }}>{avgPrice.toFixed(2)} c/kWh</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '0', borderTopLeftRadius: '0', borderTopRightRadius: '0' }}>
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <tbody>
                {priceArray.map((price, index) => {
                  const priceDate = new Date(price.time);
                  const hourStr = priceDate.getHours().toString().padStart(2, '0');
                  const isCurrentHour = isToday && priceDate.getHours() === currentHour && priceDate.toDateString() === currentDate;
                  const colors = getPriceColor(price.price);
                  const diffFromAvg = price.price - avgPrice;
                  const isCheapest3h = index >= cheapestWindowStart && index < cheapestWindowStart + 3;
                  const isExpensive3h = index >= expensiveWindowStart && index < expensiveWindowStart + 3;
                  
                  return (
                    <tr 
                      key={index}
                      className={isCurrentHour ? 'table-active' : ''}
                      style={{ 
                        fontSize: '1.1rem',
                        backgroundColor: isCheapest3h ? '#d1f4e0' : (isExpensive3h ? '#ffd6d6' : undefined),
                        borderLeft: isCheapest3h ? '4px solid #198754' : (isExpensive3h ? '4px solid #dc3545' : undefined)
                      }}
                    >
                      <td style={{ width: '35%', padding: '1rem' }}>
                        <div>
                          <strong>{hourStr}:00 - {(parseInt(hourStr) + 1).toString().padStart(2, '0')}:00</strong>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: diffFromAvg < 0 ? '#198754' : '#dc3545', marginTop: '0.25rem' }}>
                          {diffFromAvg > 0 ? '+' : ''}{diffFromAvg.toFixed(2)} c keskihinnasta
                        </div>
                      </td>
                      <td style={{ width: '15%', padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {isCurrentHour && <span style={{ color: '#ff9800' }}>NYT</span>}
                        {isCheapest3h && <span style={{ fontSize: '1.5rem' }}>⭐</span>}
                        {isExpensive3h && <span style={{ fontSize: '1.5rem' }}>⚠️</span>}
                      </td>
                      <td style={{ width: '50%', padding: '1rem', textAlign: 'right' }}>
                        <span 
                          style={{ 
                            backgroundColor: colors.bg, 
                            color: colors.text,
                            fontSize: '1.1rem',
                            padding: '0.6rem 1.2rem',
                            minWidth: '130px',
                            fontWeight: 'bold',
                            borderRadius: '0.375rem',
                            display: 'inline-block'
                          }}
                        >
                          {price.price.toFixed(2)} c/kWh
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="bg-light">
          <Row className="g-2 text-center small">
            <Col xs={6} sm={2}>
              <div style={{ backgroundColor: '#198754', color: 'white', padding: '4px', borderRadius: '4px' }}>
                &lt; 10 c
              </div>
            </Col>
            <Col xs={6} sm={2}>
              <div style={{ backgroundColor: '#0dcaf0', color: 'black', padding: '4px', borderRadius: '4px' }}>
                10-20 c
              </div>
            </Col>
            <Col xs={6} sm={2}>
              <div style={{ backgroundColor: '#ffc107', color: 'black', padding: '4px', borderRadius: '4px' }}>
                20-30 c
              </div>
            </Col>
            <Col xs={6} sm={2}>
              <div style={{ backgroundColor: '#fd7e14', color: 'white', padding: '4px', borderRadius: '4px' }}>
                30-50 c
              </div>
            </Col>
            <Col xs={12} sm={2}>
              <div style={{ backgroundColor: '#dc3545', color: 'white', padding: '4px', borderRadius: '4px' }}>
                &gt; 50 c
              </div>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
      </div>
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

    // Dynamic sizing based on screen width
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
    
    const chartHeight = isMobile ? 350 : isTablet ? 400 : 400;
    const chartPadding = isMobile 
      ? { top: 20, bottom: 90, left: 60, right: 20 }
      : { top: 20, bottom: 80, left: 80, right: 50 };
    const fontSize = isMobile ? 10 : 12;
    const labelAngle = isMobile ? -60 : -45;

    return (
      <div style={{ width: '100%', height: 'auto' }}>
        <VictoryChart
          containerComponent={<VictoryVoronoiContainer />}
          padding={chartPadding}
          height={chartHeight}
          width={isMobile ? window.innerWidth - 60 : undefined}
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
                fontSize: fontSize, 
                angle: labelAngle,
                textAnchor: 'end'
              },
              grid: { stroke: '#e9ecef', strokeWidth: 1 },
            }}
            tickFormat={(x) => {
              const date = new Date(x);
              return `${date.getHours().toString().padStart(2, '0')}:00`;
            }}
            tickCount={isMobile ? 8 : 12}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#6c757d' },
              tickLabels: { fill: '#6c757d', fontSize: fontSize },
              grid: { stroke: '#e9ecef', strokeWidth: 1 },
              axisLabel: { padding: isMobile ? 40 : 50, fontSize: isMobile ? 12 : 14, fill: '#495057' }
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
      </div>
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

      {/* Main Tabs: Lista ja Kaaviot */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        defaultActiveKey="list"
      >
        {/* LISTA TAB - Default */}
        <Tab 
          eventKey="list" 
          title={
            <span>
              <ListUl className="me-2" />
              Lista
            </span>
          }
        >
          <Tabs
            defaultActiveKey="listToday"
            className="mb-3"
          >
            <Tab 
              eventKey="listToday" 
              title={
                <span>
                  <Calendar className="me-2" />
                  Tänään
                </span>
              }
            >
              {renderPriceList(todayPrices, true, todayStats)}
            </Tab>
            
            <Tab 
              eventKey="listTomorrow" 
              title={
                <span>
                  <CalendarPlus className="me-2" />
                  Huomenna {' '}
                  {tomorrowPrices.length > 0 ? (
                    <Badge bg="success" className="ms-1">{tomorrowPrices.length}h</Badge>
                  ) : (
                    <Badge bg="secondary" className="ms-1">Ei saatavilla</Badge>
                  )}
                </span>
              }
            >
              {renderPriceList(tomorrowPrices, false, tomorrowStats)}
            </Tab>
          </Tabs>
        </Tab>

        {/* KAAVIOT TAB */}
        <Tab 
          eventKey="charts" 
          title={
            <span>
              <BarChart className="me-2" />
              Kaaviot
            </span>
          }
        >
          {/* Kaaviotyyppi-valitsimet */}
          <div className="d-flex justify-content-end mb-3">
            <ButtonGroup>
              <Button 
                variant={chartType === 'area' ? 'primary' : 'outline-primary'}
                onClick={() => setChartType('area')}
                size="sm"
              >
                <Activity className="me-1" />
                Alue
              </Button>
              <Button 
                variant={chartType === 'line' ? 'primary' : 'outline-primary'}
                onClick={() => setChartType('line')}
                size="sm"
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

          <Tabs
            defaultActiveKey="chartsToday"
            className="mb-3"
          >
            <Tab 
              eventKey="chartsToday" 
              title={
                <span>
                  <Calendar className="me-2" />
                  Tänään
                </span>
              }
            >
              {renderStatsCards(todayStats, todayPrices, true)}
              
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
              eventKey="chartsTomorrow" 
              title={
                <span>
                  <CalendarPlus className="me-2" />
                  Huomenna {' '}
                  {tomorrowPrices.length > 0 ? (
                    <Badge bg="success" className="ms-1">{tomorrowPrices.length}h</Badge>
                  ) : (
                    <Badge bg="secondary" className="ms-1">Ei saatavilla</Badge>
                  )}
                </span>
              }
            >
              {tomorrowPrices.length > 0 ? (
                <>
                  {renderStatsCards(tomorrowStats, tomorrowPrices, false)}
                  
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
                <Row className="mt-4">
                  <Col>
                    <Alert variant="warning" className="d-flex align-items-start shadow-sm">
                      <CalendarPlus size={40} className="me-3 mt-1 text-warning" />
                      <div className="flex-grow-1">
                        <h5 className="mb-3">
                          <strong>Huomisen sähkön hinnat eivät ole vielä saatavilla</strong>
                        </h5>
                        <p className="mb-3">
                          Seuraavan päivän sähkön hinnat julkaistaan yleensä päivittäin noin <strong>klo 15:00</strong> (klo 14:00-16:00 välillä).
                        </p>
                        <div className="mb-2">
                          <Clock className="me-2" size={16} />
                          <strong>Nykyinen aika:</strong> {new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <hr className="my-3" />
                        <small className="text-muted">
                          <strong>Huom:</strong> Nord Pool julkaisee seuraavan päivän hinnat automaattisesti kun ne tulevat saataville. 
                          Sivu päivittyy tunnin välein, tai voit päivittää sivun manuaalisesti.
                        </small>
                      </div>
                    </Alert>
                  </Col>
                </Row>
              )}
            </Tab>
          </Tabs>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ElectricityPrice;
