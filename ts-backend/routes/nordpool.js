const express = require('express');
const router = express.Router();

router.get('/prices', async (req, res) => {
  try {
    console.log('Fetching electricity prices from porssisahko.net API');

    // Fetch latest prices (includes today and tomorrow if available)
    const response = await fetch(
      'https://api.porssisahko.net/v1/latest-prices.json',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TalosaveApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.prices) {
      throw new Error('Invalid API response format');
    }

    // Separate prices into today and tomorrow based on dates
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const todayPrices = [];
    const tomorrowPrices = [];

    data.prices.forEach(item => {
      const itemDate = new Date(item.startDate);
      
      const priceData = {
        time: item.startDate,
        price: item.price,
        priceEur: item.price * 10
      };

      if (itemDate >= todayStart && itemDate < tomorrowStart) {
        todayPrices.push(priceData);
      } else if (itemDate >= tomorrowStart && itemDate < tomorrowEnd) {
        tomorrowPrices.push(priceData);
      }
    });

    // Sort by time (oldest first)
    todayPrices.sort((a, b) => new Date(a.time) - new Date(b.time));
    tomorrowPrices.sort((a, b) => new Date(a.time) - new Date(b.time));

    console.log(`Found ${todayPrices.length} prices for today, ${tomorrowPrices.length} for tomorrow`);

    res.json({
      success: true,
      today: todayPrices,
      tomorrow: tomorrowPrices,
      currency: 'EUR',
      unit: 'c/kWh',
      source: 'Nord Pool',
      updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch electricity prices',
      message: error.message
    });
  }
});

module.exports = router;
