// ========================================
// NAVIGATION.JS - COMPOSANT NAVIGATION
// ========================================
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/navigation.scss';

function Navigation() {
  const location = useLocation();
  
  // Fonction pour vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="main-nav">
      <Link 
        to="/" 
        className={`nav-link ${isActive('/') ? 'active' : ''}`}
      >
        Home
      </Link>
      <Link 
        to="/services" 
        className={`nav-link ${isActive('/services') ? 'active' : ''}`}
      >
        Services
      </Link>
      <Link 
        to="/team" 
        className={`nav-link ${isActive('/team') ? 'active' : ''}`}
      >
        Team
      </Link>
      <Link 
        to="/about" 
        className={`nav-link ${isActive('/about') ? 'active' : ''}`}
      >
        About
      </Link>
      <Link 
        to="/shop" 
        className={`nav-link ${isActive('/shop') ? 'active' : ''}`}
      >
        Shop
      </Link>
    </nav>
  );
}

export default Navigation;