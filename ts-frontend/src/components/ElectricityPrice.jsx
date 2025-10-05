import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory';

// Using Finnish electricity price API (Nordpool/Entso-e alternative)
const ELECTRICITY_API_URL = 'https://api.porssisahko.net/v1/latest-prices.json';

async function fetchLatestPriceData() {
  try {
    const response = await fetch(ELECTRICITY_API_URL);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON, got ${contentType}. Response: ${text.substring(0, 100)}...`);
    }
    
    return response.json();
  } catch (error) {
    // Fallback to mock data if external API fails
    console.warn('External API failed, using mock data:', error);
    return {
      prices: generateMockPriceData()
    };
  }
}

// Generate mock electricity price data for fallback
function generateMockPriceData() {
  const now = new Date();
  const prices = [];
  
  for (let i = 0; i < 24; i++) {
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i);
    // Generate realistic electricity prices (5-25 cents/kWh)
    const basePrice = 12;
    const variation = Math.sin(i * Math.PI / 12) * 8; // Peak hours variation
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
  const [chartType, setChartType] = useState('line');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setError(null); // Clear previous errors
        const data = await fetchLatestPriceData();
        
        // Handle different API response formats
        const pricesArray = data.prices || data || [];
        
        if (!Array.isArray(pricesArray) || pricesArray.length === 0) {
          throw new Error('Sähkön hintatiedot eivät ole saatavilla');
        }
        
        setPrices(pricesArray);
      } catch (e) {
        console.error('Electricity price fetch error:', e);
        setError(`Hinnan haku epäonnistui: ${e.message}`);
        
        // Set fallback mock data
        setPrices(generateMockPriceData());
      }
    };

    fetchPrice();
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#ffffff', borderRadius: '10px' }}>
        <h3 style={{ color: '#00ffcc' }}>Sähkön hinta</h3>
        <div style={{ 
          backgroundColor: '#ff6b6b', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          ⚠️ {error}
        </div>
        <p style={{ color: '#cccccc' }}>
          Käytetään esimerkki hintatietoja. Todellinen hinta voi poiketa.
        </p>
      </div>
    );
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toDateString();

  const formattedPrices = prices.map(price => {
    const priceDate = new Date(price.startDate);
    return {
      x: priceDate,
      y: price.price,
      label: `Hinta: ${price.price} snt/kWh\nAika: ${priceDate.toLocaleString()}`,
      isCurrentHour: priceDate.getHours() === currentHour && priceDate.toDateString() === currentDate
    };
  });

  const toggleChartType = () => {
    setChartType(chartType === 'line' ? 'bar' : 'line');
  };

  const buttonStyle = {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#00ffcc',
    color: '#1e1e1e',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s'
  };

  const buttonHoverStyle = {
    backgroundColor: '#bbffcc',
    color: '#1e1e1e',
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#ffffff', borderRadius: '10px' }}>
      <h3 style={{ color: '#00ffcc' }}>Sähkön hinta</h3>
      <button
        onClick={toggleChartType}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
          e.target.style.color = buttonHoverStyle.color;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = buttonStyle.backgroundColor;
          e.target.style.color = buttonStyle.color;
        }}
      >
        Vaihda kaavio
      </button>
      {prices.length > 0 ? (
        <VictoryChart
          containerComponent={<VictoryVoronoiContainer />}
          style={{
            parent: {
              background: '#1e1e1e',
              border: '1px solid #00ffcc',
              borderRadius: '10px',
              padding: '25px'
            }
          }}
        >
          <VictoryAxis
            style={{
              axis: { stroke: '#00ffcc' },
              tickLabels: { fill: '#00ffcc' },
              grid: { stroke: '#333333' },
            }}
            tickFormat={(x) => `${new Date(x).getHours()}:00\n${new Date(x).toLocaleDateString()}`}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#00ffcc' },
              tickLabels: { fill: '#00ffcc' },
              grid: { stroke: '#333333' }
            }}
          />
          {chartType === 'line' ? (
            <VictoryLine
              data={formattedPrices}
              style={{
                data: { stroke: '#00ffcc', strokeWidth: 2 },
                labels: { fill: '#ffffff', fontSize: 10, padding: 10 }
              }}
              labels={({ datum }) => datum.label}
              labelComponent={<VictoryTooltip style={{ fill: '#000' }} />}
            />
          ) : (
            <VictoryBar
              data={formattedPrices}
              style={{
                data: {
                  fill: ({ datum }) => datum.isCurrentHour ? 'orange' : (datum.y > 20 ? 'red' : '#00ffcc'),
                  width: 5,
                  padding: 15
                },
                labels: { fill: '#ffffff', fontSize: 10, padding: 15 }
              }}
              labels={({ datum }) => datum.label}
              labelComponent={<VictoryTooltip style={{ fill: '#000' }} />}
            />
          )}
        </VictoryChart>
      ) : (
        <p>Ladataan...</p>
      )}
    </div>
  );
};

export default ElectricityPrice;