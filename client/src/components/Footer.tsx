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
    { name: 'facebook', src: Facebook, href: 'https://www.facebook.com/profile.php?id=61577357139254&sk=about' },
    { name: 'youtube', src: YouTube, href: 'https://www.youtube.com/PipzoMarkets' },
    { name: 'instagram', src: Instagram, href: 'https://www.instagram.com/pipzomarket' },
    { name: 'twitter', src: Twitter, href: 'https://x.com/pipzomarket' },
    { name: 'linkedin', src: LinkedIn, href: 'https://www.linkedin.com/company/PipzoMarkets' },
    { name: 'telegram', src: Telegram, href: 'https://t.me/PipzoMarkets' },
  ];

  const footerSections = [
    {
      heading: 'Forex Trading',
      items: [
        { name: 'What is Forex', href: '/WhatIsForex' },
        { name: 'How to Trade Forex', href: '/HowToTradeForex' },
        { name: 'Vanilla Options', href: '/VanillaOptions' },
      ],
    },
    {
      heading: 'CFD Trading',
      items: [
        { name: 'What Are CFDs', href: '/WhatAreCFDs' },
        { name: 'Bonds & Treasuries', href: '/BondsAndTreasuries' },
        { name: 'ETFs Trading', href: '/ETFsTrading' },
        { name: 'Commodities Trading', href: '/HowToTradeCommodities' },
        { name: 'Indices Trading', href: '/IndicesTrading' },
        { name: 'Stock Trading', href: '/WhatAreStocks' },
        { name: 'eBook', href: '/EbookDownload' },
      ],
    },
    {
      heading: 'Trading Platforms',
      items: [
        { name: 'WebTrader', href: '/WebTrader' },
        { name: 'PipzoMarkets App', href: '/PipzoTradeApp' },
        { name: 'Options Platform', href: '/AvaOptions' },
        { name: 'MetaTrader 4', href: '/MetaTrader' },
        { name: 'MetaTrader 5', href: '/TradeMT5' },
        { name: 'Automated Trading', href: '/Algorithmic' },
        { name: 'Mac Trading', href: '/MacTrading' },
        { name: 'Social Trading', href: '/platforms/PIPZOSocialBanner' },
      ],
    },
    {
      heading: 'Cryptocurrencies',
      items: [
        { name: 'What Are Cryptocurrencies', href: '/Cryptocurrencies'},
        { name: 'How to Trade', href: '/HowCrypto' },
        { name: 'Bitcoin, Litecoin, Ripple', href: '/BitCoinPage' },
        { name: 'Ethereum, Stellar', href: '/EthereumPage' },
        { name: 'Chainlink, Uniswap, MIOTA', href: '/ChainlinkPage' },
      ],
    },
     {
      heading: 'Education',
      items: [
        { name: 'Trading Videos', href: 'HowtoTradeOnline' },
        { name: 'For Beginners', href: '/ForexTradingCoursesPage' },
        { name: 'Market Terms', href: '/MarketTerms' },
        { name: 'Order Types', href: '/OrderTypes' },
        { name: 'Blog, Strategies', href: '/Blog' },
      ],
    },
    {
      heading: 'Company',
      items: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/ContactUs' },
        { name: 'Legal Documents', href: '/LegalDocuments' },
        { name: 'Terms of Service', href: '/RegulationTrustPage' },
      ],
    },
   
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
          {footerSections.map((section, index) => (
            <div key={index} className="col-6 col-md-4 col-lg-2">
              <h6 className="text-success">{section.heading}</h6>
              <ul className="list-unstyled small text-light">
                {section.items.map((item, i) => (
                  <li key={i} className="mb-1">
                    <a
                      href={item.href}
                      className="text-light text-decoration-none hover:text-success"
                      style={{ transition: 'color 0.2s' }}
                    >
                      {item.name}
                    </a>
                  </li>
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
            <div className="d-flex flex-wrap gap-3 mb-4">
              {socialPlatforms.map((platform, i) => (
                <a 
                  key={i} 
                  href={platform.href} 
                  className="opacity-75 hover-opacity transition-transform duration-200 hover:scale-110"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff', // White background to normalize SVG rendering
                    borderRadius: '4px' // Optional: slight rounding for consistency
                  }}>
                    <img
                      src={platform.src}
                      alt={platform.name}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'contain',
                        padding: '2px' // Padding to ensure no clipping
                      }}
                    />
                  </div>
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