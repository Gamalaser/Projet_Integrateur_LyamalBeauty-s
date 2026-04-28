// ========================================
// APP.JS - AVEC TRADUCTIONS ✅
// Corrections: Protected Routes + Sécurité + Traductions i18n + Route Checkout ✅
// ========================================
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
import ProtectedRoute from './components/ProtectedRoute';

// Import des pages
import Services from './Pages/Services';
import Team from './Pages/Team'; 
import Booking from './Pages/Booking';
import Shop from './Pages/Shop';
import Cart from './Pages/Cart';
import Account from './Pages/Account';
import CoiffeurDashboard from './Pages/CoiffeurDashboard';
import ProductDetails from './Pages/ProductDetails';
import About from './Pages/About';
import Checkout from './Pages/Checkout';

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
                  <Route path="/about" element={<About />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} /> {/* ✅ ROUTE CHECKOUT AJOUTÉE */}
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* ========================================
                      ROUTES PROTÉGÉES (connexion requise)
                  ======================================== */}
                  
                  {/* Booking - Connexion requise */}
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
// PAGE D'ACCUEIL - AVEC TRADUCTIONS ✅
// ========================================
function HomePage() {
  const { t } = useTranslation();
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
            {t('home.hero.title')}
          </h1>
          <p className="hero-subtitle">
            {t('home.hero.subtitle')}
          </p>
          <Link to="/services" className="btn-hero">
            {t('home.hero.viewServices')}
            <span className="arrow">→</span>
          </Link>
        </div>
      </section>
      
      {/* HOW IT WORKS - CARTES CLIQUABLES */}
      <section className="how-it-works">
        <h2 className="section-title">{t('home.howItWorks.title')}</h2>
        <div className="steps-container">
          
          {/* STEP 1 - Explore Profiles → /team */}
          <Link to="/team" className="step-card">
            <div className="icon-circle">
              <FaSearch className="step-icon" />
            </div>
            <h3 className="step-title">{t('home.howItWorks.step1.title')}</h3>
            <p className="step-description">
              {t('home.howItWorks.step1.description')}
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
            <h3 className="step-title">{t('home.howItWorks.step2.title')}</h3>
            <p className="step-description">
              {t('home.howItWorks.step2.description')}
            </p>
          </div>
          
          {/* STEP 3 - Enjoy the Result → /services */}
          <Link to="/services" className="step-card">
            <div className="icon-circle">
              <FaStar className="step-icon" />
            </div>
            <h3 className="step-title">{t('home.howItWorks.step3.title')}</h3>
            <p className="step-description">
              {t('home.howItWorks.step3.description')}
            </p>
          </Link>
          
        </div>
      </section>
      
      {/* OUR SERVICES - CARTES CLIQUABLES AVEC PROTECTION */}
      <section className="our-services">
        <h2 className="section-title">{t('home.ourServices.title')}</h2>
        
        {loadingServices ? (
          <div className="services-loading">
            <p>{t('common.loading')}</p>
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
                  <p className="service-price">{t('services.from')} {formatPrice(service.priceFrom)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2 className="section-title">{t('home.testimonials.title')}</h2>
        <div className="testimonials-container">
          
          <div className="testimonial-card">
            <div className="stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              {t('home.testimonials.testimonial1.text')}
            </p>
            <p className="client-name">{t('home.testimonials.testimonial1.author')}</p>
          </div>
          
          <div className="testimonial-card active">
            <div className="stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              {t('home.testimonials.testimonial2.text')}
            </p>
            <p className="client-name">{t('home.testimonials.testimonial2.author')}</p>
          </div>
          
          <div className="testimonial-card">
            <div className="stars">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              {t('home.testimonials.testimonial3.text')}
            </p>
            <p className="client-name">{t('home.testimonials.testimonial3.author')}</p>
          </div>
        </div>
      </section>
      
      {/* CALL TO ACTION - PROTECTION CONNEXION */}
      <section className="cta-section">
        <h2 className="cta-title">{t('home.cta.title')}</h2>
        <button 
          onClick={handleBookNowClick} 
          className="btn-cta"
        >
          {t('home.hero.bookNow')}
        </button>
      </section>
      
      {/* FOOTER */}
      <Footer />
 
    </div>
  );
}

// ========================================
// PAGE 404 - AVEC TRADUCTIONS ✅
// ========================================
function NotFoundPage() {
  const { t } = useTranslation();
  
  return (
    <div className="page-container">
      <h1>{t('home.notFound.title')}</h1>
      <p>{t('home.notFound.message')}</p>
      <Link to="/" className="btn-signup">{t('home.notFound.backHome')}</Link>
    </div>
  );
}

export default App;