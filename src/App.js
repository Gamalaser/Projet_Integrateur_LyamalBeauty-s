// ========================================
// APP.JS - VERSION COMPLÈTE FIGMA
// ========================================
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import './styles/app.scss';

// Import des icônes
import { FaCut, FaSearch, FaCalendarAlt, FaStar, FaGlobe, FaFacebook, FaInstagram, FaSnapchat } from 'react-icons/fa';

// Import de l'API
import { getServices } from './tools/apiService';

// Import des pages
import Services from './Pages/Services';
import Team from './Pages/Team'; 
import Booking from './Pages/Booking';

// ========================================
// COMPOSANT SCROLL TO TOP
// Fait scroller la page en haut à chaque changement de route
// ========================================
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// ========================================
// COMPOSANT APP PRINCIPAL
// ========================================
function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        
        {/* HEADER */}
        <header className="app-header">
          <div className="logo">
            <FaCut className="logo-icon" />
            <span className="logo-text">LYAMAL BEAUTY'S</span>
          </div>
          
          <nav className="main-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/team" className="nav-link">Team</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/shop" className="nav-link">Shop</Link>
          </nav>
          
          <div className="header-right">
            <div className="language-switcher">
              <FaGlobe className="globe-icon" />
              <span className="lang-text">FR / EN</span>
            </div>
            <button className="btn-login">Login</button>
            <button className="btn-signup">Sign Up</button>
          </div>
        </header>
        
        {/* CONTENU */}
        <main className="main-content">
         <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<Services />} />
              <Route path="/team" element={<Team />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/booking" element={<Booking />} />
        </Routes>

        </main>
        
      </div>
    </Router>
  );
}

// ========================================
// PAGE D'ACCUEIL COMPLÈTE
// ========================================
function HomePage() {
  // États pour charger les services depuis l'API
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Charger les services au montage du composant
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const data = await getServices();
        setServices(data);
      } catch (err) {
        console.error('Error loading services for home page:', err);
        // En cas d'erreur, on garde un tableau vide
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="home-page">
      
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Book Your Professional Stylist<br />in a Few Clicks
          </h1>
          <p className="hero-subtitle">
            Experience luxury beauty services with top-rated professionals in your area
          </p>
          <Link to="/services" className="btn-hero">
            Discover Our Services
            <span className="arrow">→</span>
          </Link>
        </div>
      </section>
      
      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works?</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="icon-circle">
              <FaSearch className="step-icon" />
            </div>
            <h3 className="step-title">Explore Profiles</h3>
            <p className="step-description">
              Browse through our curated list of professional stylists and discover their specialties
            </p>
          </div>
          
          <div className="step-card">
            <div className="icon-circle">
              <FaCalendarAlt className="step-icon" />
            </div>
            <h3 className="step-title">Book Online</h3>
            <p className="step-description">
              Select your preferred service, date and time that works best for your schedule
            </p>
          </div>
          
          <div className="step-card">
            <div className="icon-circle">
              <FaStar className="step-icon" />
            </div>
            <h3 className="step-title">Enjoy the Result</h3>
            <p className="step-description">
              Relax and let our professionals deliver exceptional results tailored to your style
            </p>
          </div>
        </div>
      </section>
      
      {/* OUR SERVICES - MODIFIÉ POUR CHARGER DEPUIS L'API */}
      <section className="our-services">
        <h2 className="section-title">Our Services</h2>
        
        {loadingServices ? (
          <div className="services-loading">
            <p>Loading services...</p>
          </div>
        ) : (
          <div className="services-grid">
            {/* Afficher les 4 premiers services depuis l'API */}
            {services.slice(0, 4).map((service) => (
              <div key={service.id} className="service-card">
                <div 
                  className="service-image" 
                  style={{backgroundImage: `url(${service.image})`}}
                >
                  <div className="service-overlay"></div>
                </div>
                <div className="service-info">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-price">from ${service.priceFrom}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonials-container">
          
          <div className="testimonial-card">
            <div className="stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              "The booking process was so easy and convenient. Great experience from start to finish. Highly recommend!"
            </p>
            <p className="client-name">— Sarah T.</p>
          </div>
          
          <div className="testimonial-card active">
            <div className="stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              "Amazing service! The stylist was professional and really listened to what I wanted. Will definitely be back."
            </p>
            <p className="client-name">— Michael R.</p>
          </div>
          
          <div className="testimonial-card">
            <div className="stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              "Best salon experience I've had! The platform makes everything so simple and the results are always perfect."
            </p>
            <p className="client-name">— Jessica L.</p>
          </div>
          
        </div>
      </section>
      
      {/* CALL TO ACTION */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to book your next appointment?</h2>
        <Link to="/services" className="btn-cta">Book Now</Link>
      </section>
      
      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-content">
          
          {/* Colonne 1 : Logo et description */}
          <div className="footer-column">
            <div className="footer-logo">
              <FaCut className="footer-logo-icon" />
              <span className="footer-logo-text">LYAMAL BEAUTY'S</span>
            </div>
            <p className="footer-description">
              Your first destination for professional beauty services. Book top-rated stylists and enjoy luxury treatments in your area.
            </p>
          </div>
          
          {/* Colonne 2 : Quick Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/team">Our Team</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/shop">Shop</Link></li>
            </ul>
          </div>
          
          {/* Colonne 3 : Follow Us */}
          <div className="footer-column">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaFacebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaInstagram />
              </a>
              <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaSnapchat />
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; 2026 LYAMAL BEAUTY'S - All rights reserved</p>
        </div>
      </footer>
      
    </div>
  );
}

// ========================================
// AUTRES PAGES (Temporaires)
// ========================================

function AboutPage() {
  return (
    <div className="page-container">
      <h1>About Us</h1>
      <p>Learn more about LYAMAL BEAUTY'S</p>
    </div>
  );
}

function ShopPage() {
  return (
    <div className="page-container">
      <h1>Shop</h1>
      <p>Browse our professional beauty products</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="page-container">
      <h1>Page Not Found</h1>
      <p>Sorry, this page doesn't exist.</p>
      <Link to="/" className="btn-signup">Back to Home</Link>
    </div>
  );
}

export default App;