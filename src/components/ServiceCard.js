
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/servicecard.scss';

function ServiceCard({ service }) {
  return (
    <div className="service-card-component">
      <div 
        className="service-card-image" 
        style={{backgroundImage: `url(${service.image})`}}
      >
        <div className="service-card-overlay">
          <span className="service-card-badge">{service.category}</span>
        </div>
      </div>
      
      <div className="service-card-content">
        <h3 className="service-card-name">{service.name}</h3>
        <p className="service-card-description">{service.description}</p>
        
        <div className="service-card-details">
          <div className="detail-item">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{service.duration} min</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Price</span>
            <span className="detail-value">${service.priceFrom}+</span>
          </div>
        </div>
        
        <Link to="/booking" className="btn-book-service">
          Book Now
        </Link>
      </div>
    </div>
  );
}

export default ServiceCard;