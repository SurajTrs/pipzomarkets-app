const axios = require('axios');

// You'll need to sign up for a forex data API like Alpha Vantage, FCSAPI, or Finnhub
const API_KEY = process.env.FOREX_API_KEY || 'your_api_key';

const getForexRates = async (symbols) => {
  try {
    // This is an example using FCSAPI - replace with your chosen API
    const symbolsStr = symbols.join(',');
    const response = await axios.get(
      `https://fcsapi.com/api-v3/forex/latest?symbol=${symbolsStr}&access_key=${API_KEY}`
    );
    
    return response.data.response;
  } catch (error) {
    console.error('Forex API error:', error);
    throw new Error('Failed to fetch forex rates');
  }
};

module.exports = {
  getForexRates
};