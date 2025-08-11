// ... existing code ...

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

// ... existing code ...