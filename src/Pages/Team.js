// ========================================
// TEAM.JS - PAGE ÉQUIPE DES COIFFEURS
// ========================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaFilter, FaCut } from 'react-icons/fa';
import '../styles/pages/team.scss';

// ========================================
// DONNÉES DES COIFFEURS (temporaire)
// Plus tard, on les récupérera depuis Firestore
// ========================================
const teamData = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Master Stylist",
    genre: "Female",
    specialties: ["Hair Cutting", "Coloring", "Styling"],
    experience: 8,
    rating: 4.9,
    reviewsCount: 127,
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80",
    bio: "Passionate about creating stunning transformations with over 8 years of experience."
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    title: "Barber Specialist",
    genre: "Male",
    specialties: ["Men's Cuts", "Beard", "Fades"],
    experience: 6,
    rating: 4.8,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    bio: "Expert in classic and modern men's cuts with precision and attention to detail."
  },
  {
    id: 3,
    name: "Emily Chen",
    title: "Color Specialist",
    genre: "Female",
    specialties: ["Coloring", "Highlights", "Balayage"],
    experience: 10,
    rating: 5.0,
    reviewsCount: 156,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    bio: "Award-winning colorist specializing in natural-looking highlights and vivid colors."
  },
  {
    id: 4,
    name: "David Thompson",
    title: "Senior Stylist",
    genre: "Male",
    specialties: ["Hair Cutting", "Styling", "Treatments"],
    experience: 12,
    rating: 4.9,
    reviewsCount: 203,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    bio: "With 12 years of experience, I bring creativity and expertise to every style."
  },
  {
    id: 5,
    name: "Jessica Martinez",
    title: "Nail Artist & Stylist",
    genre: "Female",
    specialties: ["Nails", "Manicure", "Pedicure"],
    experience: 5,
    rating: 4.7,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
    bio: "Creating beautiful nail art and providing relaxing spa experiences."
  },
  {
    id: 6,
    name: "Alex Kim",
    title: "Hair & Makeup Artist",
    genre: "Mixed",
    specialties: ["Hair Cutting", "Styling", "Makeup"],
    experience: 7,
    rating: 4.8,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    bio: "Specializing in bridal and event styling with a creative touch."
  }
];

// ========================================
// COMPOSANT TEAM PAGE
// ========================================
function Team() {
  // États pour les filtres
  const [genreFilter, setGenreFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // Filtrer les coiffeurs selon les critères
  const filteredTeam = teamData.filter(stylist => {
    const matchGenre = genreFilter === 'All' || stylist.genre === genreFilter;
    const matchSpecialty = specialtyFilter === 'All' || 
                          stylist.specialties.includes(specialtyFilter);
    
    return matchGenre && matchSpecialty;
  });

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