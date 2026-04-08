// ========================================
// HEADER.JS - VERSION AVEC SÉLECTEUR DE DEVISES ✅
// CORRECTION: FaScissors → FaCut
// ========================================
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCut, FaShoppingCart, FaUser, FaChevronDown, FaGlobe } from 'react-icons/fa'; // ✅ FaCut au lieu de FaScissors
import { useAuth } from '../tools/AuthContext';
import { useCart } from '../tools/CartContext';
import { useCurrency } from '../tools/CurrencyContext';
import '../styles/components/header.scss';

function Header() {
  const { currentUser, logout, getUserRole } = useAuth();
  const { getTotalItems } = useCart();
  const { getCurrencyInfo, getAvailableCurrencies, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  
  // États pour les menus déroulants
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Refs pour fermer les menus au clic extérieur
  const userMenuRef = useRef(null);
  const currencyMenuRef = useRef(null);
  
  // Charger le rôle utilisateur
  useEffect(() => {
    if (currentUser) {
      const loadRole = async () => {
        const role = await getUserRole();
        setUserRole(role);
      };
      loadRole();
    } else {
      setUserRole(null);
    }
  }, [currentUser, getUserRole]);
  
  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target)) {
        setShowCurrencyMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };
  
  // Obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!currentUser?.displayName) return '?';
    const names = currentUser.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return currentUser.displayName[0].toUpperCase();
  };
  
  // Changer la devise
  const handleCurrencyChange = (currencyCode) => {
    changeCurrency(currencyCode);
    setShowCurrencyMenu(false);
  };
  
  const currentCurrency = getCurrencyInfo();
  const availableCurrencies = getAvailableCurrencies();
  
  return (
    <header className="app-header">
      
      {/* LOGO */}
      <Link to="/" className="logo">
        <FaCut className="logo-icon" /> {/* ✅ FaCut au lieu de FaScissors */}
        <span className="logo-text">LYAMAL BEAUTY'S</span>
      </Link>
      
      {/* NAVIGATION */}
      <nav className="main-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/services" className="nav-link">Services</Link>
        <Link to="/team" className="nav-link">Team</Link>
        <Link to="/booking" className="nav-link">Booking</Link>
        <Link to="/shop" className="nav-link">Shop</Link>
        <Link to="/about" className="nav-link">About</Link>
      </nav>
      
      {/* PARTIE DROITE */}
      <div className="header-right">
        
        {/* SÉLECTEUR DE LANGUE */}
        <div className="language-switcher">
          <FaGlobe className="globe-icon" />
          <span className="lang-text">EN</span>
        </div>
        
        {/* SÉLECTEUR DE DEVISES */}
        <div className="currency-selector" ref={currencyMenuRef}>
          <button 
            className="currency-button"
            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
          >
            <span className="currency-flag">{currentCurrency.flag}</span>
            <span className="currency-code">{currentCurrency.code}</span>
            <FaChevronDown className="currency-arrow" />
          </button>
          
          {showCurrencyMenu && (
            <div className="currency-dropdown">
              {availableCurrencies.map(curr => (
                <button
                  key={curr.code}
                  className={`currency-option ${curr.code === currentCurrency.code ? 'active' : ''}`}
                  onClick={() => handleCurrencyChange(curr.code)}
                >
                  <span className="option-flag">{curr.flag}</span>
                  <span className="option-code">{curr.code}</span>
                  <span className="option-symbol">({curr.symbol})</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* SI NON CONNECTÉ : Login / Sign Up */}
        {!currentUser && (
          <>
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-signup">Sign Up</Link>
          </>
        )}
        
        {/* SI CONNECTÉ : Panier + Menu Utilisateur */}
        {currentUser && (
          <>
            {/* ICÔNE PANIER (seulement pour les clients) */}
            {userRole === 'client' && (
              <Link to="/cart" className="cart-link">
                <FaShoppingCart className="cart-icon" />
                {getTotalItems() > 0 && (
                  <span className="cart-badge">{getTotalItems()}</span>
                )}
              </Link>
            )}
            
            {/* MENU UTILISATEUR */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {getUserInitials()}
                </div>
                <FaChevronDown className="user-arrow" />
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {getUserInitials()}
                    </div>
                    <div className="user-details">
                      <p className="user-name">{currentUser.displayName || 'User'}</p>
                      <p className="user-email">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="user-menu-divider"></div>
                  
                  {userRole === 'client' && (
                    <Link 
                      to="/account" 
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser /> My Account
                    </Link>
                  )}
                  
                  {userRole === 'coiffeur' && (
                    <Link 
                      to="/coiffeur-dashboard" 
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser /> Dashboard
                    </Link>
                  )}
                  
                  <div className="user-menu-divider"></div>
                  
                  <button 
                    className="user-menu-item logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        
      </div>
    </header>
  );
}

export default Header;