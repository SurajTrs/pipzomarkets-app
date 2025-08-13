const axios = require('axios');

// OANDA practice base URL
const OANDA_PRACTICE_BASE = 'https://api-fxpractice.oanda.com/v3';

class OandaClient {
  constructor({ apiKey, accountId, environment = 'practice' }) {
    if (!apiKey || !accountId) {
      throw new Error('OANDA apiKey and accountId are required');
    }
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.baseURL = environment === 'live' ? 'https://api-fxtrade.oanda.com/v3' : OANDA_PRACTICE_BASE;
    this.http = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
  }

  // Place a market order. type: 'buy' | 'sell'. units: positive integer number of units.
  async placeMarketOrder({ instrument, type, units, clientOrderId }) {
    if (!instrument || !type || !units) {
      throw new Error('instrument, type, units are required');
    }

    // OANDA uses positive units for buy, negative for sell
    const signedUnits = type === 'sell' ? -Math.abs(units) : Math.abs(units);

    const payload = {
      order: {
        type: 'MARKET',
        instrument,
        units: String(signedUnits),
        timeInForce: 'FOK',
        positionFill: 'DEFAULT',
        clientExtensions: clientOrderId ? { id: clientOrderId } : undefined
      }
    };

    const url = `/accounts/${this.accountId}/orders`;
    const res = await this.http.post(url, payload);
    return res.data;
  }

  async getOrder(orderId) {
    const url = `/accounts/${this.accountId}/orders/${orderId}`;
    const res = await this.http.get(url);
    return res.data;
  }

  async cancelOrder(orderId) {
    const url = `/accounts/${this.accountId}/orders/${orderId}/cancel`; 
    const res = await this.http.put(url);
    return res.data;
  }

  async getPositions() {
    const url = `/accounts/${this.accountId}/openPositions`;
    const res = await this.http.get(url);
    return res.data;
  }

  async getAccountSummary() {
    const url = `/accounts/${this.accountId}/summary`;
    const res = await this.http.get(url);
    return res.data;
  }
}

module.exports = { OandaClient };
