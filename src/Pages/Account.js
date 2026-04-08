// ========================================
// ACCOUNT.JS - PAGE COMPTE UTILISATEUR
// VERSION CORRIGÉE : Bookings depuis API + Devises ✅
// ========================================
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ useNavigate ajouté
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext'; // ✅ AJOUTÉ
import { getClientBookings, deleteBooking } from '../tools/apiService'; // ✅ deleteBooking ajouté
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import '../styles/pages/account.scss';

function Account() {
  const { currentUser, logout } = useAuth();
  const { formatPrice } = useCurrency(); // ✅ AJOUTÉ
  const navigate = useNavigate(); // ✅ AJOUTÉ
  
  // États
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // États pour les bookings (API) ✅ AJOUTÉ
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
  
  // ✅ CHARGER LES BOOKINGS DEPUIS L'API
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
        setErrorBookings('Failed to load your bookings');
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [currentUser]);
  
  // ✅ FONCTION POUR ANNULER UNE RÉSERVATION
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      // Rafraîchir la liste des bookings
      setBookings(bookings.filter(b => b.id !== bookingId));
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // ✅ FONCTION POUR REPROGRAMMER UNE RÉSERVATION
  const handleRescheduleBooking = (bookingId) => {
    // Rediriger vers la page booking
    // TODO: Plus tard, on pourra pré-remplir les données
    navigate('/booking');
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // L'utilisateur sera redirigé automatiquement par AuthContext
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
          <h1 className="page-title">Welcome back, {userData.name.split(' ')[0]}!</h1>
          <p className="page-subtitle">Manage your profile and bookings</p>
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
              <FaUser /> Profile
            </button>
            <button
              className={`sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FaCalendarAlt /> My Bookings
            </button>
            <button className="sidebar-btn logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
          
          {/* ZONE PRINCIPALE */}
          <div className="account-main">
            
            {/* PROFIL */}
            {activeTab === 'profile' && (
              <div className="profile-section">
                <div className="section-header">
                  <h2>Profile Information</h2>
                  {!isEditing ? (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                      <FaEdit /> Edit Profile
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                        Cancel
                      </button>
                      <button className="btn-save" onClick={handleSaveProfile}>
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="profile-form">
                  <div className="form-group">
                    <label><FaUser /> Full Name</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><FaEnvelope /> Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                    />
                    <small>Email cannot be changed</small>
                  </div>
                  
                  <div className="form-group">
                    <label><FaPhone /> Phone Number</label>
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><FaMapMarkerAlt /> Address</label>
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
            
            {/* BOOKINGS - ✅ CHARGEMENT DEPUIS API */}
            {activeTab === 'bookings' && (
              <div className="bookings-section">
                <div className="section-header">
                  <h2>My Bookings</h2>
                  <Link to="/booking" className="btn-new-booking">
                    + New Booking
                  </Link>
                </div>
                
                {/* ✅ LOADING STATE */}
                {loadingBookings && (
                  <div className="bookings-loading">
                    <div className="spinner"></div>
                    <p>Loading your bookings...</p>
                  </div>
                )}
                
                {/* ✅ ERROR STATE */}
                {errorBookings && (
                  <div className="bookings-error">
                    <p>{errorBookings}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                  </div>
                )}
                
                {/* ✅ EMPTY STATE */}
                {!loadingBookings && !errorBookings && bookings.length === 0 && (
                  <div className="bookings-empty">
                    <FaCalendarAlt className="empty-icon" />
                    <h3>No bookings yet</h3>
                    <p>Start by booking your first appointment!</p>
                    <Link to="/booking" className="btn-book-now">
                      Book Now
                    </Link>
                  </div>
                )}
                
                {/* ✅ BOOKINGS LIST */}
                {!loadingBookings && !errorBookings && bookings.length > 0 && (
                  <div className="bookings-list">
                    {bookings.map(booking => (
                      <div key={booking.id} className="booking-card">
                        <div className="booking-status">
                          <span className={`status-badge ${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="booking-details">
                          <h3>{booking.serviceName || booking.service}</h3>
                          <p className="booking-stylist">with {booking.stylistName || booking.stylist}</p>
                          <div className="booking-info">
                            <span><FaCalendarAlt /> {booking.date}</span>
                            <span>at {booking.time}</span>
                          </div>
                        </div>
                        
                        <div className="booking-price">
                          {formatPrice(booking.price)} {/* ✅ CONVERSION DEVISE */}
                        </div>
                        
                        {booking.status === 'pending' && (
                          <div className="booking-actions">
                            <button 
                              className="btn-reschedule"
                              onClick={() => handleRescheduleBooking(booking.id)}
                            >
                              Reschedule
                            </button>
                            <button 
                              className="btn-cancel-booking"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
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