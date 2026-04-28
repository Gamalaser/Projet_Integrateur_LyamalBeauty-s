// importation des librairies et styles nécessaires pour le composant Header
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCut, FaShoppingCart, FaUser, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../tools/AuthContext';
import { useCart } from '../tools/CartContext';
import { useCurrency } from '../tools/CurrencyContext';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/components/header.scss';

// ici j'ai créé un composant Header qui affiche l'en-tête du site avec le logo, 
// la navigation, le sélecteur de langue, le sélecteur de devises, 
// les liens de connexion/inscription et le menu utilisateur.
function Header() {
  const { t } = useTranslation();
  const { currentUser, logout, getUserRole } = useAuth();
  const { getTotalItems } = useCart();
  const { getCurrencyInfo, getAvailableCurrencies, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  // États pour gérer l'affichage des menus déroulants et le rôle utilisateur
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  const userMenuRef = useRef(null);
  const currencyMenuRef = useRef(null);
  
  // ici nous vérifions le rôle de l'utilisateur connecté pour adapter la navigation et les fonctionnalités disponibles.
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
  
  // ici nous avons ajouté un effet pour fermer les menus déroulants lorsque l'utilisateur clique en dehors de ceux-ci, 
  // en utilisant des références pour détecter les clics à l'extérieur des menus utilisateur et de sélection de devises.
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
  
  // ici nous avons créé une fonction isStylist pour vérifier si l'utilisateur a un rôle de coiffeur ou professionnel, 
  // afin de restreindre l'accès à certaines parties de la navigation pour les stylistes, 
  // et nous avons ajouté une fonction handleBlockedClick pour gérer les clics sur les liens bloqués en affichant une alerte.
  const isStylist = () => {
    return userRole === 'stylist' || userRole === 'professional';
  };
  
  // ici nous avons créé une fonction handleBlockedClick pour gérer les clics sur les liens bloqués en affichant
  //  une alerte indiquant que la navigation est restreinte aux clients, 
  // et invitant les stylistes à utiliser leur tableau de bord pour gérer leurs réservations et services.
  const handleBlockedClick = (e) => {
    e.preventDefault();
    alert('🔒 Access Restricted\n\nThis navigation is only available for clients. As a stylist, please use your dashboard to manage your bookings and services.');
  };
  
  // ici nous avons créé une fonction handleLogout pour gérer la déconnexion de l'utilisateur, 
  // qui appelle la fonction logout du contexte d'authentification, 
  // ferme le menu utilisateur et redirige vers la page d'accueil.
  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };
  
  // ici nous avons créé une fonction getUserInitials pour obtenir les initiales de l'utilisateur à partir de son nom complet,
  // afin d'afficher ces initiales dans l'avatar utilisateur du header. 
  // Si le nom complet n'est pas disponible, nous affichons un point d'interrogation.
  const getUserInitials = () => {
    if (!currentUser?.displayName) return '?';
    const names = currentUser.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return currentUser.displayName[0].toUpperCase();
  };
  
  // ici nous avons créé une fonction handleCurrencyChange pour gérer le changement de devise,
  // qui appelle la fonction changeCurrency du contexte de devises avec le code de la devise sélectionnée, 
  // et ferme le menu de sélection de devises.
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
        <FaCut className="logo-icon" />
        <span className="logo-text">LYAMAL BEAUTY'S</span>
      </Link>
      
      {/* NAVIGATION */}
      <nav className={`main-nav ${isStylist() ? 'stylist-restricted' : ''}`}>
        {isStylist() ? (
          // ✅ STYLISTS : Navigation bloquée et floutée
          <>
            <span className="nav-link blocked" onClick={handleBlockedClick} title="Access restricted to clients">{t('header.home')}</span>
            <span className="nav-link blocked" onClick={handleBlockedClick} title="Access restricted to clients">{t('header.services')}</span>
            <span className="nav-link blocked" onClick={handleBlockedClick} title="Access restricted to clients">{t('header.team')}</span>
            <span className="nav-link blocked" onClick={handleBlockedClick} title="Access restricted to clients">{t('header.booking')}</span>
            <span className="nav-link blocked" onClick={handleBlockedClick} title="Access restricted to clients">{t('header.shop')}</span>
            <span className="nav-link blocked" onClick={handleBlockedClick} title="Access restricted to clients">{t('header.about')}</span>
          </>
        ) : (
          // ici on affiche la navigation normale pour les clients et les visiteurs non connectés, 
          // avec des liens vers les différentes pages du site, 
          // et les textes des liens sont traduits en utilisant la fonction t du hook useTranslation pour supporter l'internationalisation.
          <>
            <Link to="/" className="nav-link">{t('header.home')}</Link>
            <Link to="/services" className="nav-link">{t('header.services')}</Link>
            <Link to="/team" className="nav-link">{t('header.team')}</Link>
            <Link to="/booking" className="nav-link">{t('header.booking')}</Link>
            <Link to="/shop" className="nav-link">{t('header.shop')}</Link>
            <Link to="/about" className="nav-link">{t('header.about')}</Link>
          </>
        )}
      </nav>
      
      {/* PARTIE DROITE */}
      <div className="header-right">
        
        {/* SÉLECTEUR DE LANGUE */}
        <LanguageSwitcher />
        
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
            <Link to="/login" className="btn-login">{t('header.login')}</Link>
            <Link to="/register" className="btn-signup">{t('header.signup')}</Link>
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
                      <FaUser /> {t('header.myAccount')}
                    </Link>
                  )}
                  
                  {(userRole === 'stylist' || userRole === 'professional') && (
                    <Link 
                      to="/coiffeur-dashboard" 
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser /> {t('header.dashboard')}
                    </Link>
                  )}
                  
                  <div className="user-menu-divider"></div>
                  
                  <button 
                    className="user-menu-item logout"
                    onClick={handleLogout}
                  >
                    {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        
      </div>

      {/*  STYLES POUR LA NAVIGATION BLOQUÉE */}
      <style jsx>{`
        .main-nav.stylist-restricted {
          position: relative;
        }

        .nav-link.blocked {
          filter: blur(2px);
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: auto;
          user-select: none;
          position: relative;
        }

        .nav-link.blocked:hover {
          filter: blur(2px);
          opacity: 0.5;
          color: inherit;
        }

        .nav-link.blocked::after {
          content: '🔒';
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 10px;
          opacity: 0.7;
        }
      `}</style>
    </header>
  );
}

export default Header;