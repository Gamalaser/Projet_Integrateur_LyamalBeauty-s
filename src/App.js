// ========================================
// APP.JS - AVEC PROTECTED ROUTES ✅
// Corrections: Protected Routes + Sécurité
// ========================================
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

import './styles/app.scss';

// Import des icônes
import { FaSearch, FaCalendarAlt, FaStar } from 'react-icons/fa';

// Import de l'API
import { getServices } from './tools/apiService';

// Import des Contexts
import { AuthProvider, useAuth } from './tools/AuthContext';
import { CartProvider } from './tools/CartContext';
import { CurrencyProvider, useCurrency } from './tools/CurrencyContext';

// Import des composants
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute'; // ✅ AJOUTÉ

// Import des pages
import Services from './Pages/Services';
import Team from './Pages/Team'; 
import Booking from './Pages/Booking';
import Shop from './Pages/Shop';
import Cart from './Pages/Cart';
import Account from './Pages/Account';
import CoiffeurDashboard from './Pages/CoiffeurDashboard';
import ProductDetails from './Pages/ProductDetails';

// ========================================
// COMPOSANT SCROLL TO TOP
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
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="App">
              
              {/* HEADER */}
              <Header />
              
              {/* CONTENU */}
              <main className="main-content">
                <Routes>
                  {/* ========================================
                      ROUTES PUBLIQUES (accessibles à tous)
                  ======================================== */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* ========================================
                      ROUTES PROTÉGÉES (connexion requise)
                  ======================================== */}
                  
                  {/* Booking - Connexion requise (déjà géré dans Booking.js) */}
                  <Route 
                    path="/booking" 
                    element={
                      <ProtectedRoute>
                        <Booking />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Account - Clients uniquement */}
                  <Route 
                    path="/account" 
                    element={
                      <ProtectedRoute requiredRole="client">
                        <Account />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Coiffeur Dashboard - Coiffeurs uniquement (stylist) */}
                  <Route 
                    path="/coiffeur-dashboard" 
                    element={
                      <ProtectedRoute requiredRole="stylist">
                        <CoiffeurDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* ========================================
                      PAGE 404 (route inexistante)
                  ======================================== */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              
            </div>
          </Router>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

// ========================================
// PAGE D'ACCUEIL - CORRIGÉE
// ========================================
function HomePage() {
  const { currentUser } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
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
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);
  
  // Gérer le clic sur "Book Now" avec vérification de connexion
  const handleBookNowClick = (e) => {
    e.preventDefault();
    if (currentUser) {
      // Si connecté, aller vers booking
      navigate('/booking');
    } else {
      // Si non connecté, aller vers login
      navigate('/login');
    }
  };

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
      
      {/* HOW IT WORKS - CARTES CLIQUABLES */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works?</h2>
        <div className="steps-container">
          
          {/* STEP 1 - Explore Profiles → /team */}
          <Link to="/team" className="step-card">
            <div className="icon-circle">
              <FaSearch className="step-icon" />
            </div>
            <h3 className="step-title">Explore Profiles</h3>
            <p className="step-description">
              Browse through our curated list of professional stylists and discover their specialties
            </p>
          </Link>
          
          {/* STEP 2 - Book Online → /booking (avec protection) */}
          <div 
            className="step-card clickable" 
            onClick={handleBookNowClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="icon-circle">
              <FaCalendarAlt className="step-icon" />
            </div>
            <h3 className="step-title">Book Online</h3>
            <p className="step-description">
              Select your preferred service, date and time that works best for your schedule
            </p>
          </div>
          
          {/* STEP 3 - Enjoy the Result → /services */}
          <Link to="/services" className="step-card">
            <div className="icon-circle">
              <FaStar className="step-icon" />
            </div>
            <h3 className="step-title">Enjoy the Result</h3>
            <p className="step-description">
              Relax and let our professionals deliver exceptional results tailored to your style
            </p>
          </Link>
          
        </div>
      </section>
      
      {/* OUR SERVICES - CARTES CLIQUABLES AVEC PROTECTION */}
      <section className="our-services">
        <h2 className="section-title">Our Services</h2>
        
        {loadingServices ? (
          <div className="services-loading">
            <p>Loading services...</p>
          </div>
        ) : (
          <div className="services-grid">
            {/* Cartes de services avec vérification de connexion */}
            {services.slice(0, 4).map((service) => (
              <div 
                key={service.id} 
                className="service-card"
                onClick={handleBookNowClick}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="service-image" 
                  style={{backgroundImage: `url(${service.image})`}}
                >
                  <div className="service-overlay"></div>
                </div>
                <div className="service-info">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-price">from {formatPrice(service.priceFrom)}</p>
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
      
      {/* CALL TO ACTION - PROTECTION CONNEXION */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to book your next appointment?</h2>
        <button 
          onClick={handleBookNowClick} 
          className="btn-cta"
        >
          Book Now
        </button>
      </section>
      
      {/* FOOTER */}
      <Footer />
      
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