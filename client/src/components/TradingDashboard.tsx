import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style.css";
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdvancedChart } from 'react-tradingview-embed';

const TradingDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Most Popular");
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
  useAuth();

  useEffect(() => {
    if (leftBoxRef.current) {
      setLeftHeight(leftBoxRef.current.clientHeight);
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Set up interval to refresh rates
    const intervalId = setInterval(() => {
      // In a real implementation, you would fetch updated rates here
      setLastUpdated(new Date());
    }, 5000); // Update every 5 seconds

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
    // ... existing instrument categories
  };

  const handleTrade = async () => {
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
      
      // Get current price based on order type
      const instrument = allInstruments[selectedCategory].find(i => i.name === selectedInstrument);
      if (!instrument) {
        toast.error("Instrument not found");
        return;
      }
      
      const price = orderType === 'buy' ? parseFloat(instrument.buy) : parseFloat(instrument.sell);
      
      // In a real implementation, you would call your API here
      // For demo purposes, we'll simulate a successful trade
      setTimeout(() => {
        toast.success(`${orderType.toUpperCase()} order placed for ${selectedInstrument} at ${price}`);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Trade error:', error);
      toast.error("Failed to place trade");
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
            />
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`w-100 mb-2 text-start px-3 py-2 rounded-3 fw-semibold ${
                  selectedCategory === cat
                    ? "bg-accent text-white"
                    : "text-light"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === cat ? "#00BFA6" : "rgba(255,255,255,0.08)",
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
                  <th>Instrument</th>
                  <th>Sell</th>
                  <th>Buy</th>
                  <th>Change</th>
                  <th>Action</th>
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
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
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
                      >
                        Buy
                      </button>
                      <button 
                        className={`btn ${orderType === 'sell' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setOrderType('sell')}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Amount ($)</label>
                    <input
                      type="number" 
                      className="form-control bg-dark text-white border-secondary" 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Leverage</label>
                    <select 
                      className="form-select bg-dark text-white border-secondary"
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
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
                    <label className="form-label">Stop Loss (optional)</label>
                    <input 
                      type="number" 
                      className="form-control bg-dark text-white border-secondary" 
                      value={stopLoss || ''}
                      onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Enter price"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Take Profit (optional)</label>
                    <input 
                      type="number" 
                      className="form-control bg-dark text-white border-secondary" 
                      value={takeProfit || ''}
                      onChange={(e) => setTakeProfit(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Enter price"
                    />
                  </div>
                  
                  <button 
                    className={`btn btn-${orderType === 'buy' ? 'success' : 'danger'} w-100`}
                    onClick={handleTrade}
                    disabled={isLoading}
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