import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "../style.css";
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdvancedChart } from 'react-tradingview-embed';
import axios from 'axios';

// Define interface for useAuth return value (adjust based on your actual useAuth implementation)
interface AuthContextType {
  user: { id: string; name: string } | null;
  isAuthenticated: boolean;
  token?: string | null;
}

// NumberInput component (from previous context)
interface NumberInputProps {
  amount: number;
  setAmount: (value: number) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({ amount, setAmount }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    }
  };

  return (
    <input
      type="number"
      className="form-control bg-dark text-white border-secondary"
      value={amount}
      onChange={handleChange}
      min="1"
      step="1"
      required
      id="amount-input"
      aria-label="Amount in dollars"
    />
  );
};

const TradingDashboard: React.FC = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("Forex Majors");
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null); // OANDA symbol e.g., EUR_USD
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(100);
  const [leverage, setLeverage] = useState<number>(1);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const leftBoxRef = useRef<HTMLDivElement>(null);
  const [, setLeftHeight] = useState<number | undefined>(undefined);
  const { isAuthenticated, token } = useAuth() as AuthContextType; // Type the useAuth return value

  const API_URL = useMemo(() => (import.meta.env.VITE_API_URL || 'http://localhost:5001/api'), []);

  useEffect(() => {
    if (leftBoxRef.current) {
      setLeftHeight(leftBoxRef.current.clientHeight);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  interface Instrument {
    name: string; // Display name e.g., EUR/USD
    symbol: string; // OANDA symbol e.g., EUR_USD
  }

  type PriceTick = {
    type: string;
    instrument?: string;
    bids?: { price: string }[];
    asks?: { price: string }[];
    time?: string;
  };

  // live prices map: symbol -> { bid, ask, base }
  const [prices, setPrices] = useState<Record<string, { bid: number; ask: number; base: number; time?: string }>>({});

  const allInstruments: Record<string, Instrument[]> = {
    "Forex Majors": [
      { name: "EUR/USD", symbol: "EUR_USD" },
      { name: "GBP/USD", symbol: "GBP_USD" },
      { name: "USD/JPY", symbol: "USD_JPY" },
      { name: "USD/CHF", symbol: "USD_CHF" },
      { name: "AUD/USD", symbol: "AUD_USD" },
      { name: "USD/CAD", symbol: "USD_CAD" }
    ]
  };

  // Initialize instrument and side from URL query params if provided
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const instr = params.get('instrument');
    const side = params.get('side');
    if (side === 'buy' || side === 'sell') setOrderType(side);
    if (instr) {
      // validate against known instruments
      const all = Object.values(allInstruments).flat();
      const exists = all.find(i => i.symbol === instr || i.name === instr);
      if (exists) {
        setSelectedInstrument(exists.symbol);
      }
    }
  }, [location.search]);

  // Start SSE stream for all instruments in the active category
  useEffect(() => {
    const list = allInstruments[selectedCategory] || [];
    const symbols = Array.from(new Set(list.map(i => i.symbol)));
    if (symbols.length === 0) return;

    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    const url = `${API_URL}/prices/stream?instruments=${encodeURIComponent(symbols.join(','))}${tokenParam}`;
    const evt = new EventSource(url);

    evt.onmessage = (e) => {
      try {
        const msg: PriceTick = JSON.parse(e.data);
        if (msg.type === 'PRICE' && msg.instrument && msg.bids && msg.asks) {
          const bid = parseFloat(msg.bids[0]?.price || '0');
          const ask = parseFloat(msg.asks[0]?.price || '0');
          setPrices(prev => {
            const base = prev[msg.instrument!]?.base ?? ((bid + ask) / 2);
            return { ...prev, [msg.instrument!]: { bid, ask, base, time: msg.time } };
          });
          setLastUpdated(new Date());
        }
      } catch { /* ignore */ }
    };

    evt.addEventListener('error', () => {
      console.warn('Price stream error');
      evt.close();
    });

    return () => evt.close();
  }, [selectedCategory, API_URL]);

  const handleTrade = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to place a trade");
      return;
    }

    if (!selectedInstrument) {
      toast.error("Please select an instrument");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      const instrument = allInstruments[selectedCategory]?.find(i => i.name === selectedInstrument || i.symbol === selectedInstrument);
      if (!instrument) {
        toast.error("Instrument not found");
        return;
      }

      // For simplicity, interpret amount as units directly.
      const units = Math.max(1, Math.round(amount)) * (orderType === 'sell' ? -1 : 1);

      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const resp = await axios.post(`${API_URL}/orders`, {
        instrument: instrument.symbol,
        type: orderType,
        units: Math.abs(units),
        clientOrderId: `cli-${Date.now()}`
      }, { headers });

      toast.success(`${orderType.toUpperCase()} order placed for ${instrument.name} (id: ${resp.data?.orderId || 'n/a'})`);
    } catch (error: any) {
      console.error('Trade error:', error);
      const msg = error?.response?.data?.message || 'Failed to place trade';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = Object.keys(allInstruments);

  return (
    <div
      className="container-fluid py-5 px-4 text-white"
      style={{
        background: "linear-gradient(to bottom right, #000000, #1a1a1a)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div className="row g-4">
        <div className="col-lg-3">
          <div
            ref={leftBoxRef}
            className="rounded-4 p-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <input
              className="form-control mb-3 bg-transparent text-white border-secondary"
              placeholder="🔍 Search instruments"
              aria-label="Search instruments"
            />
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`w-100 mb-2 text-start px-3 py-2 rounded-3 fw-semibold ${
                  selectedCategory === cat ? "bg-accent text-white" : "text-light"
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? "#00BFA6" : "rgba(255,255,255,0.08)",
                  border: "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="col-lg-9">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h4 className="m-0">Market Watch</h4>
            <small className="text-muted">Last updated: {lastUpdated.toLocaleTimeString()}</small>
          </div>

          <div
            className="rounded-4 shadow-lg overflow-hidden mb-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <table className="table text-white m-0">
              <thead style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <tr>
                  <th scope="col">Instrument</th>
                  <th scope="col">Sell</th>
                  <th scope="col">Buy</th>
                  <th scope="col">Change</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {allInstruments[selectedCategory]?.map((item, i) => {
                  const p = prices[item.symbol];
                  const mid = (p && Number.isFinite(p.bid) && Number.isFinite(p.ask)) ? (p.bid + p.ask) / 2 : undefined;
                  const changePct = (p && mid !== undefined && Number.isFinite(p.base) && p.base !== 0)
                    ? (((mid - p.base) / p.base) * 100)
                    : undefined;
                  return (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: selectedInstrument === item.name || selectedInstrument === item.symbol
                        ? "rgba(0, 191, 166, 0.2)" 
                        : "rgba(255,255,255,0.02)",
                      transition: "0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedInstrument(item.symbol)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = selectedInstrument === item.name || selectedInstrument === item.symbol
                        ? "rgba(0, 191, 166, 0.2)" 
                        : "rgba(0, 191, 166, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = selectedInstrument === item.name || selectedInstrument === item.symbol
                        ? "rgba(0, 191, 166, 0.2)" 
                        : "rgba(255,255,255,0.02)")
                    }
                  >
                    <td className="fw-bold">{item.name}</td>
                    <td className="text-info">{p ? p.bid.toFixed(5) : '--'}</td>
                    <td className="text-info">{p ? p.ask.toFixed(5) : '--'}</td>
                    <td className={changePct && changePct < 0 ? "text-danger" : "text-success"}>
                      {changePct !== undefined ? `${changePct.toFixed(2)}%` : '—'}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-success me-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstrument(item.symbol);
                          setOrderType('buy');
                        }}
                        aria-label={`Buy ${item.symbol}`}
                      >
                        Buy
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstrument(item.symbol);
                          setOrderType('sell');
                        }}
                        aria-label={`Sell ${item.symbol}`}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                );}) || (
                  <tr>
                    <td colSpan={5} className="text-center">No instruments available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedInstrument && (
            <div className="row">
              <div className="col-md-8">
                <div 
                  className="rounded-4 overflow-hidden" 
                  style={{ 
                    height: '400px',
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <AdvancedChart
                    widgetProps={{
                      symbol: selectedInstrument.includes('_') 
                        ? `FX:${selectedInstrument.replace('_', '')}` 
                        : `FX:${selectedInstrument.replace('/', '')}`,
                      theme: 'dark',
                      style: '1',
                      locale: 'en',
                      toolbar_bg: '#000000',
                      enable_publishing: false,
                      allow_symbol_change: false,
                      container_id: 'tradingview_chart',
                    }}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div 
                  className="rounded-4 p-3" 
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <h5 className="mb-3">Place Order: {selectedInstrument}</h5>

                  <div className="mb-3">
                    <div className="btn-group w-100">
                      <button 
                        className={`btn ${orderType === 'buy' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setOrderType('buy')}
                        aria-label="Select Buy Order"
                      >
                        Buy
                      </button>
                      <button 
                        className={`btn ${orderType === 'sell' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setOrderType('sell')}
                        aria-label="Select Sell Order"
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="amount-input" className="form-label">Units</label>
                    <NumberInput amount={amount} setAmount={setAmount} />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="leverage-select" className="form-label">Leverage</label>
                    <select 
                      id="leverage-select"
                      className="form-select bg-dark text-white border-secondary"
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      aria-label="Select leverage"
                    >
                      <option value="1">1:1</option>
                      <option value="2">1:2</option>
                      <option value="5">1:5</option>
                      <option value="10">1:10</option>
                      <option value="20">1:20</option>
                      <option value="50">1:50</option>
                      <option value="100">1:100</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="stop-loss-input" className="form-label">Stop Loss (optional)</label>
                    <input 
                      type="number" 
                      id="stop-loss-input"
                      className="form-control bg-dark text-white border-secondary" 
                      value={stopLoss ?? ''}
                      onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Enter price"
                      step="0.01"
                      aria-label="Stop Loss"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="take-profit-input" className="form-label">Take Profit (optional)</label>
                    <input 
                      type="number" 
                      id="take-profit-input"
                      className="form-control bg-dark text-white border-secondary" 
                      value={takeProfit ?? ''}
                      onChange={(e) => setTakeProfit(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Enter price"
                      step="0.01"
                      aria-label="Take Profit"
                    />
                  </div>

                  <button 
                    className={`btn btn-${orderType === 'buy' ? 'success' : 'danger'} w-100`}
                    onClick={handleTrade}
                    disabled={isLoading}
                    aria-label={`Place ${orderType} order for ${selectedInstrument}`}
                  >
                    {isLoading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </span>
                    ) : (
                      `${orderType === 'buy' ? 'Buy' : 'Sell'} ${selectedInstrument}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;