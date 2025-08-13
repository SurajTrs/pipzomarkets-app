const express = require('express');
const { OandaClient } = require('../brokers/oandaClient');

function createOrdersRouter(auth) {
  const router = express.Router();

  const {
    OANDA_API_KEY,
    OANDA_ACCOUNT_ID,
    OANDA_ENV
  } = process.env;

  if (!OANDA_API_KEY || !OANDA_ACCOUNT_ID) {
    console.warn('[orders] OANDA_API_KEY or OANDA_ACCOUNT_ID missing. Orders routes will error until configured.');
  }

  const oanda = (OANDA_API_KEY && OANDA_ACCOUNT_ID)
    ? new OandaClient({ apiKey: OANDA_API_KEY, accountId: OANDA_ACCOUNT_ID, environment: OANDA_ENV || 'practice' })
    : null;

  // Place market order
  router.post('/orders', auth, async (req, res) => {
    try {
      const { instrument, type, units, clientOrderId } = req.body;
      if (!instrument || !type || !units) {
        return res.status(400).json({ message: 'instrument, type, units are required' });
      }
      if (!oanda) {
        return res.status(500).json({ message: 'Broker not configured' });
      }

      const data = await oanda.placeMarketOrder({ instrument, type, units, clientOrderId });
      return res.status(201).json({ message: 'Order placed', data });
    } catch (err) {
      console.error('Place order error:', err?.response?.data || err.message);
      return res.status(500).json({ message: 'Failed to place order', details: err?.response?.data || err.message });
    }
  });

  // Get order status
  router.get('/orders/:id', auth, async (req, res) => {
    try {
      if (!oanda) {
        return res.status(500).json({ message: 'Broker not configured' });
      }
      const data = await oanda.getOrder(req.params.id);
      return res.json(data);
    } catch (err) {
      console.error('Get order error:', err?.response?.data || err.message);
      return res.status(500).json({ message: 'Failed to get order', details: err?.response?.data || err.message });
    }
  });

  // Cancel order
  router.delete('/orders/:id', auth, async (req, res) => {
    try {
      if (!oanda) {
        return res.status(500).json({ message: 'Broker not configured' });
      }
      const data = await oanda.cancelOrder(req.params.id);
      return res.json({ message: 'Order cancel requested', data });
    } catch (err) {
      console.error('Cancel order error:', err?.response?.data || err.message);
      return res.status(500).json({ message: 'Failed to cancel order', details: err?.response?.data || err.message });
    }
  });

  // Get open positions via broker
  router.get('/positions', auth, async (_req, res) => {
    try {
      if (!oanda) {
        return res.status(500).json({ message: 'Broker not configured' });
      }
      const data = await oanda.getPositions();
      return res.json(data);
    } catch (err) {
      console.error('Get positions error:', err?.response?.data || err.message);
      return res.status(500).json({ message: 'Failed to get positions', details: err?.response?.data || err.message });
    }
  });

  // Get account summary (balance, NAV, P/L, etc.)
  router.get('/account/summary', auth, async (_req, res) => {
    try {
      if (!oanda) {
        return res.status(500).json({ message: 'Broker not configured' });
      }
      const data = await oanda.getAccountSummary();
      return res.json(data);
    } catch (err) {
      console.error('Get account summary error:', err?.response?.data || err.message);
      return res.status(500).json({ message: 'Failed to get account summary', details: err?.response?.data || err.message });
    }
  });

  return router;
}

module.exports = { createOrdersRouter };
