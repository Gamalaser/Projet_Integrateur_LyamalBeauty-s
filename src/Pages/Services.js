// ========================================
// SERVICES.JS - PAGE CATALOGUE DES SERVICES
// VERSION CORRIGÉE : API + Protection connexion + DEVISES ✅
// ========================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { getServices } from '../tools/apiService';
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext'; // ✅ AJOUTÉ
import '../styles/pages/services.scss';

// ========================================
// COMPOSANT SERVICES PAGE
// ========================================
function Services() {
  const { currentUser } = useAuth(); // Pour vérifier la connexion
  const { formatPrice } = useCurrency(); // ✅ AJOUTÉ pour les devises
  const navigate = useNavigate();
  
  // États pour les données de l'API
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les services depuis l'API au montage du composant
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await getServices();
        setServices(data);
        setError(null);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []); // [] = se lance une seule fois au montage

  // Gérer le clic sur "Book Now" avec vérification de connexion
  const handleBookClick = (e) => {
    e.preventDefault();
    if (currentUser) {
      // Si connecté, aller vers booking
      navigate('/booking');
    } else {
      // Si non connecté, aller vers login
      navigate('/login');
    }
  };

  // Filtrer les services selon les critères
  const filteredServices = services.filter(service => {
    const matchCategory = categoryFilter === 'All' || service.category === categoryFilter;
    const matchGenre = genreFilter === 'All' || service.genre === genreFilter;
    const matchSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchCategory && matchGenre && matchSearch;
  });

  // Afficher spinner pendant le chargement
  if (loading) {
    return (
      <div className="services-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  // Afficher erreur si problème
  if (error) {
    return (
      <div className="services-page">
        <div className="error-container">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      
      {/* EN-TÊTE DE LA PAGE */}
      <section className="services-header">
        <div className="header-content">
          <h1 className="page-title">Our Services</h1>
          <p className="page-subtitle">
            Discover our complete range of professional beauty services tailored to your needs
          </p>
        </div>
      </section>
      
      {/* BARRE DE FILTRES */}
      <section className="filters-section">
        <div className="filters-container">
          
          {/* Barre de recherche */}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for a service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Filtres */}
          <div className="filters-group">
            <div className="filter-item">
              <FaFilter className="filter-icon" />
              <label>Category:</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Categories</option>
                <option value="Hair Cutting">Hair Cutting</option>
                <option value="Coloring">Coloring</option>
                <option value="Beard">Beard</option>
                <option value="Nails">Nails</option>
                <option value="Spa">Spa</option>
                <option value="Massage">Massage</option>
                <option value="Facial">Facial</option>
                <option value="Makeup">Makeup</option>
                <option value="Body Care">Body Care</option>
                <option value="Packages">Packages</option>
              </select>
            </div>
            
            <div className="filter-item">
              <label>Genre:</label>
              <select 
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
          
        </div>
      </section>
      
      {/* RÉSULTATS */}
      <section className="services-results">
        <div className="results-info">
          <p className="results-count">
            Showing <span className="highlight">{filteredServices.length}</span> service{filteredServices.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* GRILLE DE SERVICES */}
        <div className="services-grid">
          {filteredServices.map(service => (
            <div key={service.id} className="service-card">
              
              {/* Image du service */}
              <div 
                className="service-image"
                style={{backgroundImage: `url(${service.image})`}}
              >
                <div className="service-overlay">
                  <span className="service-badge">{service.category}</span>
                </div>
              </div>
              
              {/* Informations du service */}
              <div className="service-content">
                <h3 className="service-name">{service.name}</h3>
                <p className="service-description">{service.description}</p>
                
                <div className="service-details">
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{service.duration} min</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Genre:</span>
                    <span className="detail-value">{service.genre}</span>
                  </div>
                </div>
                
                <div className="service-footer">
                  <div className="service-price">
                    <span className="price-from">from</span>
                    <span className="price-amount">{formatPrice(service.priceFrom)}</span> {/* ✅ MODIFIÉ */}
                  </div>
                  <button 
                    onClick={handleBookClick} 
                    className="btn-book"
                  >
                    Book Now
                  </button>
                </div>
              </div>
              
            </div>
          ))}
        </div>
        
        {/* Message si aucun résultat */}
        {filteredServices.length === 0 && (
          <div className="no-results">
            <h3>No services found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        )}
        
      </section>
      
      {/* CALL TO ACTION */}
      <section className="services-cta">
        <h2 className="cta-title">Can't find what you're looking for?</h2>
        <p className="cta-text">Contact us and we'll help you find the perfect service</p>
        <button onClick={handleBookClick} className="btn-contact">
          Book a Consultation
        </button>
      </section>
      
    </div>
  );
}

export default Services;