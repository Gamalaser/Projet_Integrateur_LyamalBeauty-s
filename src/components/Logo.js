// ========================================
// LOGO.JS - COMPOSANT LOGO
// ========================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCut } from 'react-icons/fa';
import '../styles/components/logo.scss';

function Logo() {
  return (
    <Link to="/" className="logo">
      <FaCut className="logo-icon" />
      <span className="logo-text">LYAMAL BEAUTY'S</span>
    </Link>
  );
}

export default Logo;