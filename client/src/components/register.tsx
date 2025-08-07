import React, { useState } from 'react';
import '../style.css';
import chartImg from '../assets/chart.png';
import phoneImg from '../assets/phone.png';

const Registration: React.FC = () => {
  const [country, setCountry] = useState<string>('India (भारत)');

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: '#e9ffe5ff' }}>
      <div className="row g-0">
        {/* Left Panel */}
        <div className="col-12 col-md-6  text-white d-flex flex-column justify-content-center align-items-center p-0" style={{ backgroundColor: '#e9ffe5ff' }}>
          <div className="w-100 position-relative">
            <img
              src={chartImg}
              alt="Chart"
              className="img-fluid w-100"
              style={{ objectFit: 'cover', height: '100%' }}
            />
            <img
              src={phoneImg}
              alt="Phone"
              className="position-absolute d-none d-md-block"
              style={{
                width: '35%',
                bottom: '10%',
                right: '5%',
              }}
            />
            <div className="position-absolute top-0 w-100 text-center mt-4">
              <h1 className="fw-bold text-white">PIPZOMARKETS</h1>
              <p className="text-uppercase text-white">Trade with Confidence</p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center p-4" style={{ backgroundColor: '#e9ffe5ff' }}>
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="d-flex justify-content-around mb-4">
              <button className="btn btn-link text-success border-bottom border-success">Sign Up</button>
            </div>

            <form>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input type="email" className="form-control" placeholder="Enter your email" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-key"></i>
                  </span>
                  <input type="password" className="form-control" placeholder="Enter your password" />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="countrySelect" className="form-label">Country</label>
                <select
                  id="countrySelect"
                  className="form-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="India (भारत)">India (भारत)</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>

              <button type="submit" className="btn btn-success w-100 mb-3">
                Create My Account
              </button>

              <small className="d-block text-muted mb-3 text-center">
                By creating an account, you agree to the <a href="#">privacy policy</a> and to receive economic and marketing communications from PipzoMarkets.
              </small>

              <div className="text-center">
                <p className="mb-1">
                  Have a partner number? <a href="#">Click here</a>
                </p>
                <p>
                  Already have an account? <a href="/login">Login</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
