const Stripe = require('stripe');

function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY missing');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

async function createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
  const stripe = createStripeClient();
  if (!amount || amount <= 0) {
    throw new Error('amount must be > 0');
  }
  const intent = await stripe.paymentIntents.create({
    amount: Math.floor(amount),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true }
  });
  return { clientSecret: intent.client_secret, id: intent.id };
}

function verifyWebhook(req) {
  const stripe = createStripeClient();
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) throw new Error('STRIPE_WEBHOOK_SECRET missing');
  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  return event;
}

module.exports = { createPaymentIntent, verifyWebhook };
