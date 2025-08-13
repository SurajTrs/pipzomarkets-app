const express = require('express');
const { createPaymentIntent } = require('../payments/stripe');

function createPaymentsRouter(auth) {
  const router = express.Router();

  // Create a PaymentIntent for deposits
  router.post('/payments/create', auth, async (req, res) => {
    try {
      const { amount, currency = 'usd' } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'amount must be > 0' });
      }

      const { clientSecret, id } = await createPaymentIntent({
        amount: Math.floor(amount * 100), // dollars->cents if amount is in dollars
        currency,
        metadata: { userId: req.user.userId }
      });

      return res.status(201).json({ clientSecret, id });
    } catch (err) {
      console.error('Create payment intent error:', err?.message || err);
      return res.status(500).json({ message: 'Failed to create payment intent' });
    }
  });

  return router;
}

module.exports = { createPaymentsRouter };
