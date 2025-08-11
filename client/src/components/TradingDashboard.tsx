import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style.css";
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdvancedChart } from 'react-tradingview-embed';

// Define interface for useAuth return value (adjust based on your actual useAuth implementation)
interface AuthContextType {
  user: { id: string; name: string } | null; // Example, adjust as needed
  isAuthenticated: boolean;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Most Popular");
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(100);
  const [leverage, setLeverage] = useState<number>(1);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const leftBoxRef = useRef<HTMLDivElement>(null);
  const [, setLeftHeight] = useState<number | undefined>(undefined);
  const { isAuthenticated } = useAuth() as AuthContextType; // Type the useAuth return value

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
    name: string;
    sell: string;
    buy: string;
    change: string;
  }

  const allInstruments: Record<string, Instrument[]> = {
    "Most Popular": [
      { name: "TESLA", sell: "326.61", buy: "326.98", change: "-3.86%" },
      { name: "AMAZON", sell: "211.88", buy: "212.19", change: "-0.51%" },
      { name: "APPLE", sell: "201.19", buy: "201.40", change: "+0.31%" },
      { name: "NETFLIX", sell: "1.00", buy: "1.00", change: "-0.32%" },
      { name: "EUR/USD", sell: "1.1720", buy: "1.1726", change: "+0.12%" },
      { name: "GBP/USD", sell: "1.2660", buy: "1.2665", change: "-0.09%" },
      { name: "MICROSOFT", sell: "492.12", buy: "492.78", change: "+0.47%" },
      { name: "PFIZER", sell: "24.24", buy: "24.33", change: "-0.08%" },
    ],
  };

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
      const instrument = allInstruments[selectedCategory]?.find(i => i.name === selectedInstrument);
      if (!instrument) {
        toast.error("Instrument not found");
        return;
      }

      const price = orderType === 'buy' ? parseFloat(instrument.buy) : parseFloat(instrument.sell);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${orderType.toUpperCase()} order placed for ${selectedInstrument} at ${price}`);
    } catch (error) {
      console.error('Trade error:', error);
      toast.error("Failed to place trade");
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
                {allInstruments[selectedCategory]?.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: selectedInstrument === item.name 
                        ? "rgba(0, 191, 166, 0.2)" 
                        : "rgba(255,255,255,0.02)",
                      transition: "0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedInstrument(item.name)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = selectedInstrument === item.name 
                        ? "rgba(0, 191, 166, 0.2)" 
                        : "rgba(0, 191, 166, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = selectedInstrument === item.name 
                        ? "rgba(0, 191, 166, 0.2)" 
                        : "rgba(255,255,255,0.02)")
                    }
                  >
                    <td className="fw-bold">{item.name}</td>
                    <td className="text-info">{item.sell}</td>
                    <td className="text-info">{item.buy}</td>
                    <td className={item.change.startsWith("-") ? "text-danger" : "text-success"}>
                      {item.change}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-success me-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstrument(item.name);
                          setOrderType('buy');
                        }}
                        aria-label={`Buy ${item.name}`}
                      >
                        Buy
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstrument(item.name);
                          setOrderType('sell');
                        }}
                        aria-label={`Sell ${item.name}`}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                )) || (
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
                      symbol: selectedInstrument.includes('/') 
                        ? `FX:${selectedInstrument.replace('/', '')}` 
                        : `NASDAQ:${selectedInstrument}`,
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
                    <label htmlFor="amount-input" className="form-label">Amount ($)</label>
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