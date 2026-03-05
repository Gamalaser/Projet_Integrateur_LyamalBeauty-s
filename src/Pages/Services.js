// ========================================
// TEAM.JS - PAGE ÉQUIPE DES COIFFEURS
// ========================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaFilter, FaCut } from 'react-icons/fa';
import { getStylists } from '../tools/apiService';
import '../styles/pages/team.scss';

// ========================================
// COMPOSANT TEAM PAGE
// ========================================
function Team() {
  // États pour les données de l'API
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [genreFilter, setGenreFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // Charger les coiffeurs depuis l'API au montage du composant
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setLoading(true);
        const data = await getStylists();
        setStylists(data);
        setError(null);
      } catch (err) {
        console.error('Error loading stylists:', err);
        setError('Failed to load team members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStylists();
  }, []); // [] = se lance une seule fois au montage

  // Filtrer les coiffeurs selon les critères
  const filteredTeam = stylists.filter(stylist => {
    const matchGenre = genreFilter === 'All' || stylist.genre === genreFilter;
    const matchSpecialty = specialtyFilter === 'All' || 
                          stylist.specialties.includes(specialtyFilter);
    
    return matchGenre && matchSpecialty;
  });

  // Afficher spinner pendant le chargement
  if (loading) {
    return (
      <div className="team-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  // Afficher erreur si problème
  if (error) {
    return (
      <div className="team-page">
        <div className="error-container">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      
      {/* EN-TÊTE DE LA PAGE */}
      <section className="team-header">
        <div className="header-content">
          <h1 className="page-title">Meet Our Team</h1>
          <p className="page-subtitle">
            Our talented professionals are here to bring your vision to life with expertise and passion
          </p>
        </div>
      </section>
      
      {/* BARRE DE FILTRES */}
      <section className="filters-section">
        <div className="filters-container">
          
          <div className="filters-group">
            <div className="filter-item">
              <FaFilter className="filter-icon" />
              <label>Gender:</label>
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
            
            <div className="filter-item">
              <label>Specialty:</label>
              <select 
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Specialties</option>
                <option value="Hair Cutting">Hair Cutting</option>
                <option value="Coloring">Coloring</option>
                <option value="Beard">Beard</option>
                <option value="Nails">Nails</option>
                <option value="Styling">Styling</option>
              </select>
            </div>
          </div>
          
        </div>
      </section>
      
      {/* RÉSULTATS */}
      <section className="team-results">
        <div className="results-info">
          <p className="results-count">
            Showing <span className="highlight">{filteredTeam.length}</span> professional{filteredTeam.length !== 1 ? 's' : ''}
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
                    {stylist.experience} years exp.
                  </div>
                </div>
              </div>
              
              {/* Informations du coiffeur */}
              <div className="stylist-content">
                <h3 className="stylist-name">{stylist.name}</h3>
                <p className="stylist-title">{stylist.title}</p>
                
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
                    {stylist.rating} ({stylist.reviewsCount} reviews)
                  </span>
                </div>
                
                {/* Spécialités */}
                <div className="specialties">
                  {stylist.specialties.map((specialty, index) => (
                    <span key={index} className="specialty-badge">
                      {specialty}
                    </span>
                  ))}
                </div>
                
                {/* Bio */}
                <p className="stylist-bio">{stylist.bio}</p>
                
                {/* Actions */}
                <div className="stylist-footer">
                  <Link to={`/booking?stylist=${stylist.id}`} className="btn-book">
                    Book Now
                  </Link>
                  <button className="btn-view-portfolio">
                    <FaCut /> View Portfolio
                  </button>
                </div>
              </div>
              
            </div>
          ))}
        </div>
        
        {/* Message si aucun résultat */}
        {filteredTeam.length === 0 && (
          <div className="no-results">
            <h3>No stylists found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
        
      </section>
      
      {/* CALL TO ACTION */}
      <section className="team-cta">
        <h2 className="cta-title">Want to join our team?</h2>
        <p className="cta-text">We're always looking for talented professionals to join our family</p>
        <Link to="/about" className="btn-contact">Get in Touch</Link>
      </section>
      
    </div>
  );
}

export default Team;