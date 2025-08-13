
import React from 'react';
import '../style.css';
// Import placeholder images (replace with actual images when added)
import PipzoMarketLogo from '../assets/PipzoMarketLogo.png'; // Fallback for logo-white.png
import Mastercard from '../assets/mastercard.png'; // Add this file
import Visa from '../assets/visa.png'; // Add this file
import PayPal from '../assets/paypal.png'; // Add this file
import Skrill from '../assets/skrill.png'; // Add this file
import Neteller from '../assets/neteller.png'; // Add this file
import WireTransfer from '../assets/wire-transfer.png'; // Add this file
import PerfectMoney from '../assets/perfect-money.png'; // Add this file
import Boleto from '../assets/boleto.png'; // Add this file
import Facebook from '../assets/facebook.svg'; // Add this file
import YouTube from '../assets/youtube.svg'; // Add this file
import Instagram from '../assets/instagram.svg'; // Add this file
import Twitter from '../assets/twitter.svg'; // Add this file
import LinkedIn from '../assets/linkedin.svg'; // Add this file
import Telegram from '../assets/telegram.svg'; // Add this file
import GooglePlay from '../assets/google-play.png'; // Add this file
import AppStore from '../assets/app-store.png'; // Add this file

const Footer = () => {
  const paymentMethods = [
    { name: 'mastercard', src: Mastercard },
    { name: 'visa', src: Visa },
    { name: 'paypal', src: PayPal },
    { name: 'skrill', src: Skrill },
    { name: 'neteller', src: Neteller },
    { name: 'wire-transfer', src: WireTransfer },
    { name: 'perfect-money', src: PerfectMoney },
    { name: 'boleto', src: Boleto },
  ];

  const socialPlatforms = [
    { name: 'facebook', src: Facebook },
    { name: 'youtube', src: YouTube },
    { name: 'instagram', src: Instagram },
    { name: 'twitter', src: Twitter },
    { name: 'linkedin', src: LinkedIn },
    { name: 'telegram', src: Telegram },
  ];

  return (
    <footer className="pt-5 text-white" style={{ backgroundColor: '#0b0b0c' }}>
      <div className="container">
        {/* Payment Methods */}
        <div className="text-center mb-5">
          <h5 className="fw-bold mb-3 text-light">Payment Methods</h5>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            {paymentMethods.map((method, i) => (
              <img
                key={i}
                src={method.src}
                alt={method.name}
                height="19"
                className="footer-icon"
                style={{ maxWidth: '30px' }}
              />
            ))}
          </div>
        </div>

        {/* Footer Grid */}
        <div className="row g-4 mb-5">
          {[
            {
              heading: 'Forex Trading',
              items: ['What is Forex', 'How to Trade Forex', 'Vanilla Options', 'Forex Pairs'],
            },
            {
              heading: 'CFD Trading',
              items: [
                'What Are CFDs',
                'Bonds & Treasuries',
                'ETFs Trading',
                'Commodities Trading',
                'Indices Trading',
                'Stock Trading',
                'eBook',
              ],
            },
            {
              heading: 'Trading Platforms',
              items: [
                'WebTrader',
                'PipzoMarkets App',
                'Options Platform',
                'MetaTrader 4',
                'MetaTrader 5',
                'Automated Trading',
                'Mac Trading',
                'Social Trading',
              ],
            },
            {
              heading: 'Cryptocurrencies',
              items: [
                'What Are Cryptocurrencies',
                'How to Trade',
                'Bitcoin, Litecoin, Ripple',
                'Ethereum, Stellar',
                'Chainlink, Uniswap, MIOTA',
              ],
            },
            {
              heading: 'Trading Info',
              items: ['TradeProtect', 'Holiday Hours', 'Economic Calendar', 'Rollover, Calculator', 'Earnings Releases'],
            },
            {
              heading: 'Education',
              items: ['Trading Videos', 'For Beginners', 'Market Terms', 'Order Types', 'Blog, Strategies'],
            },
          ].map((section, index) => (
            <div key={index} className="col-6 col-md-4 col-lg-2">
              <h6 className="text-success">{section.heading}</h6>
              <ul className="list-unstyled small text-light">
                {section.items.map((item, i) => (
                  <li key={i} className="mb-1">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal & Subscription Row */}
        <div className="row mt-4">
          {/* Left Column: Legal Info */}
          <div className="col-12 col-md-8 text-secondary small mb-4 mb-md-0">
            <p>
              PipzoMarkets EU Ltd is regulated by the Central Bank of Ireland (No.C53877).<br />
              PipzoMarkets Ltd is regulated by the B.V.I Financial Services Commission (No. SIBA/L/13/1049).<br />
              PipzoMarkets Australia Pty Ltd is regulated by ASIC (No.406684).<br />
              PipzoMarkets Pty is regulated by FSCA (No.45984).<br />
              PipzoMarkets Japan K.K. is regulated by FSA (License No.: 1662), FFAJ (No.: 1574).<br />
              PipzoMarkets Middle East Ltd is regulated by ADGM FRSA (No.190018).<br />
              DT Direct Investment Hub Ltd. is regulated by CySEC (No. 347/17).<br /><br />
              <strong className="text-warning">CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage.</strong><br />
              76% of retail investor accounts lose money when trading CFDs with this provider.
            </p>
          </div>

          {/* Right Column: Newsletter & Social */}
          <div className="col-12 col-md-4">
            <h6 className="text-success">Get The Freshest PipzoMarkets News</h6>
            <form className="d-flex flex-column flex-sm-row mt-2 mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="form-control bg-dark text-white border-0 rounded-start rounded-sm-0 mb-2 mb-sm-0"
              />
              <button type="submit" className="btn btn-success rounded-end px-4">➤</button>
            </form>

            <h6 className="text-success mb-3">Follow Us</h6>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {socialPlatforms.map((platform, i) => (
                <a key={i} href="#" className="opacity-75 hover-opacity">
                  <img
                    src={platform.src}
                    alt={platform.name}
                    height="18px"
                    className="footer-icon"
                    style={{ maxWidth: '25px' }}
                  />
                </a>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-2">
              <img
                src={GooglePlay}
                alt="Google Play"
                height="24"
                className="footer-icon"
                style={{ maxWidth: '140px' }}
              />
              <img
                src={AppStore}
                alt="App Store"
                height="24"
                className="footer-icon"
                style={{ maxWidth: '140px' }}
              />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="text-center text-secondary small py-4 border-top mt-5">
          <img
            src={PipzoMarketLogo}
            alt="PipzoMarkets Logo"
            height="12"
            className="footer-icon me-2"
            style={{ maxWidth: '40px' }}
          />
          &copy; 2007–{new Date().getFullYear()} PipzoMarkets Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
