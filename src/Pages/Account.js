
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext';
import { getClientBookings, deleteBooking } from '../tools/apiService';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import '../styles/pages/account.scss';

function Account() {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  // États
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // États pour les bookings (API)
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorBookings, setErrorBookings] = useState(null);
  
  // Données utilisateur (temporaires - plus tard depuis Firestore)
  const [userData, setUserData] = useState({
    name: currentUser?.displayName || 'John Doe',
    email: currentUser?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Beauty Street, New York, NY 10001'
  });
  
  // CHARGER LES BOOKINGS DEPUIS L'API
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      
      try {
        setLoadingBookings(true);
        const data = await getClientBookings(currentUser.uid);
        setBookings(data);
        setErrorBookings(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setErrorBookings(t('account.bookings.loadError'));
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [currentUser, t]);
  
  // FONCTION POUR ANNULER UNE RÉSERVATION
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(t('account.bookings.cancelConfirm'))) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      alert(t('account.bookings.cancelSuccess'));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(t('account.bookings.cancelError'));
    }
  };

  // FONCTION POUR REPROGRAMMER UNE RÉSERVATION
  const handleRescheduleBooking = (bookingId) => {
    navigate('/booking');
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  const handleSaveProfile = () => {
    // TODO: Sauvegarder les modifications dans Firestore
    setIsEditing(false);
  };
  
  return (
    <div className="account-page">
      
      {/* EN-TÊTE */}
      <section className="account-header">
        <div className="header-content">
          <div className="user-avatar">
            {userData.name.charAt(0)}
          </div>
          <h1 className="page-title">{t('account.welcome', { name: userData.name.split(' ')[0] })}</h1>
          <p className="page-subtitle">{t('account.subtitle')}</p>
        </div>
      </section>
      
      {/* CONTENU */}
      <section className="account-content">
        <div className="account-container">
          
          {/* SIDEBAR - Navigation */}
          <div className="account-sidebar">
            <button
              className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> {t('account.nav.profile')}
            </button>
            <button
              className={`sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FaCalendarAlt /> {t('account.nav.bookings')}
            </button>
            <button className="sidebar-btn logout" onClick={handleLogout}>
              <FaSignOutAlt /> {t('account.nav.logout')}
            </button>
          </div>
          
          {/* ZONE PRINCIPALE */}
          <div className="account-main">
            
            {/* PROFIL */}
            {activeTab === 'profile' && (
              <div className="profile-section">
                <div className="section-header">
                  <h2>{t('account.profile.title')}</h2>
                  {!isEditing ? (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                      <FaEdit /> {t('account.profile.edit')}
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                        {t('account.profile.cancel')}
                      </button>
                      <button className="btn-save" onClick={handleSaveProfile}>
                        {t('account.profile.save')}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="profile-form">
                  <div className="form-group">
                    <label><FaUser /> {t('account.profile.fullName')}</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><FaEnvelope /> {t('account.profile.email')}</label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                    />
                    <small>{t('account.profile.emailNote')}</small>
                  </div>
                  
                  <div className="form-group">
                    <label><FaPhone /> {t('account.profile.phone')}</label>
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><FaMapMarkerAlt /> {t('account.profile.address')}</label>
                    <input
                      type="text"
                      value={userData.address}
                      onChange={(e) => setUserData({...userData, address: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="bookings-section">
                <div className="section-header">
                  <h2>{t('account.bookings.title')}</h2>
                  <Link to="/booking" className="btn-new-booking">
                    + {t('account.bookings.newBooking')}
                  </Link>
                </div>
                
                {/* LOADING STATE */}
                {loadingBookings && (
                  <div className="bookings-loading">
                    <div className="spinner"></div>
                    <p>{t('account.bookings.loading')}</p>
                  </div>
                )}
                
                {/* ERROR STATE */}
                {errorBookings && (
                  <div className="bookings-error">
                    <p>{errorBookings}</p>
                    <button onClick={() => window.location.reload()}>{t('account.bookings.retry')}</button>
                  </div>
                )}
                
                {/* EMPTY STATE */}
                {!loadingBookings && !errorBookings && bookings.length === 0 && (
                  <div className="bookings-empty">
                    <FaCalendarAlt className="empty-icon" />
                    <h3>{t('account.bookings.noBookings')}</h3>
                    <p>{t('account.bookings.noBookingsText')}</p>
                    <Link to="/booking" className="btn-book-now">
                      {t('account.bookings.bookNow')}
                    </Link>
                  </div>
                )}
                
                {/* BOOKINGS LIST */}
                {!loadingBookings && !errorBookings && bookings.length > 0 && (
                  <div className="bookings-list">
                    {bookings.map(booking => (
                      <div key={booking.id} className="booking-card">
                        <div className="booking-status">
                          <span className={`status-badge ${booking.status.toLowerCase()}`}>
                            {t(`account.bookings.status.${booking.status.toLowerCase()}`)}
                          </span>
                        </div>
                        
                        <div className="booking-details">
                          <h3>{booking.serviceName || booking.service}</h3>
                          <p className="booking-stylist">{t('account.bookings.with')} {booking.stylistName || booking.stylist}</p>
                          <div className="booking-info">
                            <span><FaCalendarAlt /> {booking.date}</span>
                            <span>{t('account.bookings.at')} {booking.time}</span>
                          </div>
                        </div>
                        
                        <div className="booking-price">
                          {formatPrice(booking.price)}
                        </div>
                        
                        {booking.status === 'pending' && (
                          <div className="booking-actions">
                            <button 
                              className="btn-reschedule"
                              onClick={() => handleRescheduleBooking(booking.id)}
                            >
                              {t('account.bookings.reschedule')}
                            </button>
                            <button 
                              className="btn-cancel-booking"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              {t('account.bookings.cancel')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
          
        </div>
      </section>
      
    </div>
  );
}

export default Account;