const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { setupMarketDataService } = require('./marketDataService');
const { createOrdersRouter } = require('./routes/orders');
const { createPaymentsRouter } = require('./routes/payments');
const { verifyWebhook } = require('./payments/stripe');
const { openPricingStream } = require('./brokers/oandaPricing');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());

// Stripe webhook endpoint must receive the raw body to validate signature.
// IMPORTANT: This route MUST be defined BEFORE express.json().
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = verifyWebhook(req);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const userId = intent.metadata?.userId;
      const amountReceived = intent.amount_received; // in smallest currency unit (e.g., cents)
      if (userId && amountReceived) {
        try {
          // Credit user's platform balance (converting cents->dollars)
          await User.findByIdAndUpdate(userId, { $inc: { balance: amountReceived / 100 } });
        } catch (dbErr) {
          console.error('Stripe webhook DB update error:', dbErr);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err.message || 'invalid payload'}`);
  }
});

// Parse JSON for all other routes
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pipzomarkets')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 10000 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user data
app.get('/api/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      balance: user.balance
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Trade Schema
const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instrument: { type: String, required: true },
  type: { type: String, required: true, enum: ['buy', 'sell'] },
  amount: { type: Number, required: true },
  leverage: { type: Number, default: 1 },
  openPrice: { type: Number, required: true },
  currentPrice: { type: Number },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  openTime: { type: Date, default: Date.now },
  closeTime: { type: Date },
  closePrice: { type: Number },
  profit: { type: Number },
  status: { type: String, default: 'open', enum: ['open', 'closed'] }
});

const Trade = mongoose.model('Trade', tradeSchema);

// Place a new trade
app.post('/api/trades', auth, async (req, res) => {
  try {
    const { instrument, type, amount, openPrice, stopLoss, takeProfit, leverage } = req.body;
    
    // Validate input
    if (!instrument || !type || !amount || !openPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user has enough balance
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Create new trade
    const trade = new Trade({
      userId: req.user.userId,
      instrument,
      type,
      amount,
      openPrice,
      stopLoss,
      takeProfit,
      leverage: leverage || 1,
      status: 'open'
    });
    
    await trade.save();
    
    // Update user balance
    user.balance -= amount;
    await user.save();
    
    res.status(201).json({
      message: 'Trade placed successfully',
      trade,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Place trade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's open trades
app.get('/api/trades/open', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ 
      userId: req.user.userId,
      status: 'open'
    }).sort({ openTime: -1 });
    
    res.json(trades);
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's trade history
app.get('/api/trades/history', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ 
      userId: req.user.userId,
      status: 'closed'
    }).sort({ closeTime: -1 });
    
    res.json(trades);
  } catch (error) {
    console.error('Get trade history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Close a trade
app.put('/api/trades/:id/close', auth, async (req, res) => {
  try {
    const { closePrice } = req.body;
    
    if (!closePrice) {
      return res.status(400).json({ message: 'Close price is required' });
    }
    
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    if (trade.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (trade.status === 'closed') {
      return res.status(400).json({ message: 'Trade already closed' });
    }
    
    // Calculate profit/loss
    let profit = 0;
    if (trade.type === 'buy') {
      profit = (closePrice - trade.openPrice) * trade.amount * trade.leverage;
    } else {
      profit = (trade.openPrice - closePrice) * trade.amount * trade.leverage;
    }
    
    // Update trade
    trade.closePrice = closePrice;
    trade.closeTime = Date.now();
    trade.profit = profit;
    trade.status = 'closed';
    
    await trade.save();
    
    // Update user balance
    const user = await User.findById(req.user.userId);
    user.balance += (trade.amount + profit);
    await user.save();
    
    res.json({
      message: 'Trade closed successfully',
      trade,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Close trade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
        // Create a transporter for sending emails
    // Note: For production, you should set these values in your .env file
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // or another email service
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // replace with your email in .env
        pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password' // use app password for Gmail
      }
    });
    
    // Create the reset URL with the token
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5174';
    const resetUrl = `${clientURL}/reset-password?token=${resetToken}`;
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'PipzoMarkets - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #198754;">Password Reset</h1>
          <p>You requested a password reset for your PipzoMarkets account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #198754; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">PipzoMarkets - Trading Platform</p>
        </div>
      `
    };
    
    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (emailError) {
      // If email sending fails, log the error but don't expose it to the client
      console.error('Email sending error:', emailError);
      // Still log the token for testing purposes
      console.log(`Reset token for ${email}: ${resetToken}`);
    }
    
    res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link',
      // In a real app, you wouldn't return the token in the response
      // This is just for demonstration purposes
      resetToken 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password endpoint
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mount real trading (OANDA) and payments (Stripe) routes
app.use('/api', createOrdersRouter(auth));
app.use('/api', createPaymentsRouter(auth));

// Live/practice pricing stream via OANDA (SSE)
// Usage: GET /api/prices/stream?instruments=EUR_USD,GBP_USD
app.get('/api/prices/stream', (req, res) => {
  // Auth via query param token because EventSource cannot set headers
  const token = (req.query.token || '').toString();
  try {
    if (!token) return res.status(401).end();
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).end();
  }
  const instrumentsParam = (req.query.instruments || 'EUR_USD').toString();
  const instruments = instrumentsParam.split(',').map(s => s.trim()).filter(Boolean);
  const { OANDA_API_KEY, OANDA_ACCOUNT_ID, OANDA_ENV } = process.env;

  if (!OANDA_API_KEY || !OANDA_ACCOUNT_ID) {
    return res.status(500).json({ message: 'Broker not configured' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const close = openPricingStream({
    apiKey: OANDA_API_KEY,
    accountId: OANDA_ACCOUNT_ID,
    instruments,
    environment: OANDA_ENV || 'practice',
    onData: (msg) => {
      // Forward pricing and heartbeat messages to client
      res.write(`data: ${JSON.stringify(msg)}\n\n`);
    },
    onError: (err) => {
      console.error('Pricing stream error:', err?.message || err);
      try { res.write(`event: error\ndata: ${JSON.stringify({ message: 'stream_error' })}\n\n`); } catch {}
      try { res.end(); } catch {}
    }
  });

  req.on('close', () => {
    try { close && close(); } catch {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});