
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { getServices } from '../tools/apiService';
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext';
import '../styles/pages/services.scss';

// ici nous avons créé une page Services qui affiche une liste de services de beauté disponibles, 
// avec des filtres de recherche et de catégorie.
function Services() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  // États pour les données de l'API
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [categoryFilter, setCategoryFilter] = useState('All');
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
        setError(t('services.error.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [t]);

  // Gérer le clic sur "Book Now" avec vérification de connexion
  const handleBookClick = (service) => {
    if (currentUser) {
      navigate('/booking', { state: { selectedService: service } });
    } else {
      navigate('/login', { state: { from: '/booking', service } });
    }
  };

  // Obtenir les catégories uniques dynamiquement (comme Shop.js)
  const categories = ['All', ...new Set(services.map(s => s.category).filter(Boolean))];

  // Filtrer les services selon les critères
  const filteredServices = services.filter(service => {
    const matchCategory = categoryFilter === 'All' || service.category === categoryFilter;
    const matchSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchCategory && matchSearch;
  });

  // Afficher spinner pendant le chargement
  if (loading) {
    return (
      <div className="services-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Afficher erreur si problème
  if (error) {
    return (
      <div className="services-page">
        <div className="error-container">
          <h2>{t('services.error.title')}</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>{t('services.error.retry')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      
      {/* EN-TÊTE DE LA PAGE */}
      <section className="services-header">
        <div className="header-content">
          <h1 className="page-title">{t('services.title')}</h1>
          <p className="page-subtitle">
            {t('services.subtitle')}
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
              placeholder={t('services.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Filtres - CATÉGORIES DYNAMIQUES */}
          <div className="filters-group">
            <div className="filter-item">
              <FaFilter className="filter-icon" />
              <label>{t('services.filters.category')}:</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? t('services.filters.allCategories') : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
        </div>
      </section>
      
      {/* RÉSULTATS */}
      <section className="services-results">
        <div className="results-info">
          <p className="results-count">
            {t('services.results.showing')} <span className="highlight">{filteredServices.length}</span> {filteredServices.length !== 1 ? t('services.results.services') : t('services.results.service')}
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
                    <span className="detail-label">{t('services.card.duration')}:</span>
                    <span className="detail-value">{service.duration} {t('services.card.minutes')}</span>
                  </div>
                  {service.popular && (
                    <div className="detail-item">
                      <span className="popular-badge">⭐ {t('services.card.popular')}</span>
                    </div>
                  )}
                </div>
                
                <div className="service-footer">
                  <div className="service-price">
                    <span className="price-from">{t('services.from')}</span>
                    <span className="price-amount">{formatPrice(service.priceFrom)}</span>
                  </div>
                  <button 
                    onClick={() => handleBookClick(service)}
                    className="btn-book"
                  >
                    {t('services.bookService')}
                  </button>
                </div>
              </div>
              
            </div>
          ))}
        </div>
        
        {/* Message si aucun résultat */}
        {filteredServices.length === 0 && (
          <div className="no-results">
            <h3>{t('services.noResults.title')}</h3>
            <p>{t('services.noResults.message')}</p>
          </div>
        )}
        
      </section>
      
      {/* CALL TO ACTION */}
      <section className="services-cta">
        <h2 className="cta-title">{t('services.cta.title')}</h2>
        <p className="cta-text">{t('services.cta.text')}</p>
        <button onClick={() => handleBookClick(null)} className="btn-contact">
          {t('services.cta.button')}
        </button>
      </section>
      
    </div>
  );
}

export default Services;