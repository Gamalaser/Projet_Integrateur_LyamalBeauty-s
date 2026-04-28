// importation des librairies et styles nécessaires pour le composant Footer
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCut, FaFacebook, FaInstagram, FaSnapchat } from 'react-icons/fa';
import '../styles/components/footer.scss';

// ici j'ai créé un composant Footer qui affiche le pied de page du site avec le logo, 
// une description, des liens rapides et des icônes de réseaux sociaux.
function Footer() {
  return (
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
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://snapchat.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
              aria-label="Snapchat"
            >
              <FaSnapchat />
            </a>
          </div>
        </div>
        
      </div>
      
      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LYAMAL BEAUTY'S - All rights reserved</p>
      </div>
    </footer>
  );
}

export default Footer;