// importation des librairies et styles nécessaires pour le composant CoiffeurCard
import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import '../styles/components/coiffeurcard.scss';

// ici j'ai créé un composant CoiffeurCard qui prend en props un objet stylist contenant les informations du coiffeur.
function CoiffeurCard({ stylist }) {
  return (
    //ici on affiche la carte du coiffeur avec son image, son nom, son titre, sa note, ses spécialités et un bouton pour réserver un rendez-vous.
    <div className="coiffeur-card-component">
      <div 
        className="coiffeur-image" 
        style={{backgroundImage: `url(${stylist.image})`}}
      >
        <div className="coiffeur-overlay">
          <span className="experience-badge">{stylist.experience} years</span>
        </div>
      </div>
      
      <div className="coiffeur-content">
        <h3 className="coiffeur-name">{stylist.name}</h3>
        <p className="coiffeur-title">{stylist.title}</p>
        
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
        
        <div className="specialties">
          {stylist.specialties.slice(0, 3).map((specialty, index) => (
            <span key={index} className="specialty-badge">
              {specialty}
            </span>
          ))}
        </div>
        
        <Link to={`/booking?stylist=${stylist.id}`} className="btn-book-stylist">
          Book Appointment
        </Link>
      </div>
    </div>
  );
}

export default CoiffeurCard;