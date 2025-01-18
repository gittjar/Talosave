import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory';

const LATEST_PRICES_ENDPOINT = '/api/v1/latest-prices.json';

async function fetchLatestPriceData() {
  const response = await fetch(LATEST_PRICES_ENDPOINT);
  return response.json();
}

const ElectricityPrice = () => {
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const data = await fetchLatestPriceData();
        setPrices(data.prices);
      } catch (e) {
        setError(`Hinnan haku epäonnistui, syy: ${e}`);
      }
    };

    fetchPrice();
  }, []);

  if (error) {
    return <div>{error}</div>;
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