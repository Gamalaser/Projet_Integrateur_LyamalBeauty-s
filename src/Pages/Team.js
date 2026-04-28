
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaFilter } from 'react-icons/fa';
import { getStylists } from '../tools/apiService';
import '../styles/pages/team.scss';

// ici nous avons créé une page Team qui affiche une liste de coiffeurs professionnels,
// avec des filtres de genre et de spécialité, et des informations détaillées sur chaque coiffeur.
function Team() {
  const { t } = useTranslation();
  
  // États pour les données de l'API
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [genreFilter, setGenreFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // Charger les stylists depuis l'API au montage du composant
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setLoading(true);
        const data = await getStylists();
        setStylists(data);
        setError(null);
      } catch (err) {
        console.error('Error loading stylists:', err);
        setError(t('team.error.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchStylists();
  }, [t]);

  // Filtrer les stylists selon les critères
  const filteredTeam = stylists.filter(stylist => {
    const matchGenre = genreFilter === 'All' || stylist.genre === genreFilter;
    const matchSpecialty = specialtyFilter === 'All' || 
                          stylist.specialties.includes(specialtyFilter);
    
    return matchGenre && matchSpecialty;
  });

  // Obtenir les genres uniques (dynamique)
  const genres = ['All', ...new Set(stylists.map(s => s.genre).filter(Boolean))];

  // Obtenir les spécialités uniques (dynamique)
  const allSpecialties = ['All', ...new Set(stylists.flatMap(s => s.specialties || []))];

  // Afficher spinner pendant le chargement
  if (loading) {
    return (
      <div className="team-page">
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
      <div className="team-page">
        <div className="error-container">
          <h2>{t('team.error.title')}</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>{t('team.error.retry')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      
      {/* EN-TÊTE DE LA PAGE */}
      <section className="team-header">
        <div className="header-content">
          <h1 className="page-title">{t('team.title')}</h1>
          <p className="page-subtitle">
            {t('team.subtitle')}
          </p>
        </div>
      </section>
      
      {/* BARRE DE FILTRES */}
      <section className="filters-section">
        <div className="filters-container">
          
          <div className="filters-group">
            {/* Filtre par genre - DYNAMIQUE */}
            <div className="filter-item">
              <FaFilter className="filter-icon" />
              <label>{t('team.filters.gender')}:</label>
              <select 
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="filter-select"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'All' ? t('team.filters.genderOptions.all') : genre}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtre par spécialité - DYNAMIQUE */}
            <div className="filter-item">
              <label>{t('team.filters.specialty')}:</label>
              <select 
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="filter-select"
              >
                {allSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'All' ? t('team.filters.allSpecialties') : specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
        </div>
      </section>
      
      {/* RÉSULTATS */}
      <section className="team-results">
        <div className="results-info">
          <p className="results-count">
            {t('team.results.showing')} <span className="highlight">{filteredTeam.length}</span> {filteredTeam.length !== 1 ? t('team.results.professionals') : t('team.results.professional')}
          </p>
        </div>
        
        {/* GRILLE DES COIFFEURS */}
        <div className="team-grid">
          {filteredTeam.map(stylist => (
            <div key={stylist.id} className="stylist-card">
              
              {/* Image du coiffeur */}
              <div 
                className="stylist-image"
                style={{backgroundImage: `url(${stylist.image})`}}
              >
                <div className="stylist-overlay">
                  <div className="experience-badge">
                    {stylist.experience} {t('team.card.yearsExp')}
                  </div>
                </div>
              </div>
              
              {/* Informations du coiffeur */}
              <div className="stylist-content">
                <h3 className="stylist-name">{stylist.name}</h3>
                <p className="stylist-title">{stylist.title || t('team.card.specialist')}</p>
                
                {/* Note avec étoiles */}
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, index) => (
                      <FaStar 
                        key={index} 
                        className={index < Math.floor(stylist.rating) ? 'star filled' : 'star'}
                      />
                    ))}
                  </div>
                  <span className="rating-text">
                    {stylist.rating} ({stylist.reviewsCount || 0} {t('team.card.reviews')})
                  </span>
                </div>
                
                {/* Spécialités */}
                <div className="specialties">
                  {stylist.specialties && stylist.specialties.map((specialty, index) => (
                    <span key={index} className="specialty-badge">
                      {specialty}
                    </span>
                  ))}
                </div>
                
                {/* Bio */}
                <p className="stylist-bio">{stylist.bio}</p>
                
                {/* Actions */}
                <div className="stylist-footer">
                  <Link 
                    to="/booking" 
                    state={{ selectedStylist: stylist }}
                    className="btn-book"
                  >
                    {t('team.card.bookNow')}
                  </Link>
                </div>
              </div>
              
            </div>
          ))}
        </div>
        
        {/* Message si aucun résultat */}
        {filteredTeam.length === 0 && (
          <div className="no-results">
            <h3>{t('team.noResults.title')}</h3>
            <p>{t('team.noResults.message')}</p>
          </div>
        )}
        
      </section>
      
      {/* CALL TO ACTION */}
      <section className="team-cta">
        <h2 className="cta-title">{t('team.cta.title')}</h2>
        <p className="cta-text">{t('team.cta.text')}</p>
        <Link to="/register" className="btn-contact">{t('team.cta.button')}</Link>
      </section>
      
    </div>
  );
}

export default Team;