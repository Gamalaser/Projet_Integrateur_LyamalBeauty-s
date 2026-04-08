// ========================================
// BOOKING.JS - PAGE RÉSERVATION
// VERSION AVEC VÉRIFICATION CONNEXION ✅
// ========================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaCalendarAlt, FaClock, FaUser, FaUpload, FaStickyNote } from 'react-icons/fa';
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext';
import { getServices, getStylists } from '../tools/apiService';
import '../styles/pages/booking.scss';

function Booking() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { formatPrice } = useCurrency();

  // États
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Données de réservation
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [notes, setNotes] = useState('');

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, stylistsData] = await Promise.all([
          getServices(),
          getStylists()
        ]);
        setServices(servicesData || []);
        setStylists(stylistsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // VÉRIFICATION CONNEXION - SI NON CONNECTÉ, AFFICHER MESSAGE
  if (!currentUser) {
    return (
      <div className="booking-page">
        <section className="booking-header">
          <h1 className="page-title">Book an Appointment</h1>
          <p className="page-subtitle">Schedule your beauty treatment with our experts</p>
        </section>

        <div className="auth-required-container">
          <div className="auth-required-card">
            <div className="auth-icon">
              <FaUser />
            </div>
            <h2>Sign In Required</h2>
            <p>You need to be signed in to book an appointment</p>
            <div className="auth-buttons">
              <button 
                className="btn-login"
                onClick={() => navigate('/login', { state: { from: '/booking' } })}
              >
                Sign In
              </button>
              <button 
                className="btn-register"
                onClick={() => navigate('/register', { state: { from: '/booking' } })}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Créneaux horaires disponibles
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Gérer l'upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Navigation entre étapes
  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Vérifier si l'étape est complète
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedStylist !== null;
      case 3:
        return selectedDate !== '' && selectedTime !== '';
      default:
        return true;
    }
  };

  // Confirmer la réservation
  const handleConfirmBooking = async () => {
    try {
      // Créer l'objet de réservation
      const bookingData = {
        clientId: currentUser.uid,
        clientName: currentUser.displayName || currentUser.email,
        clientEmail: currentUser.email,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        stylistId: selectedStylist?.id || 'auto',
        stylistName: selectedStylist?.name || 'First Available',
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        price: selectedService.priceFrom,
        status: 'pending',
        notes: notes,
        referenceImage: referenceImage,
        createdAt: new Date().toISOString()
      };

      // Envoyer à l'API (à implémenter)
      console.log('Booking data:', bookingData);

      // Aller à l'étape de confirmation
      setCurrentStep(4);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  // Rendu du contenu selon l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">Choose a Service</h2>
            <div className="services-grid">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <img src={service.image} alt={service.name} className="service-img" />
                  <h3>{service.name}</h3>
                  <p className="service-duration">{service.duration} min</p>
                  <p className="service-price">{formatPrice(service.priceFrom)}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">Choose Your Stylist</h2>
            
            <div
              className={`first-available ${selectedStylist === 'auto' ? 'selected' : ''}`}
              onClick={() => setSelectedStylist('auto')}
            >
              <div className="auto-icon">⚡</div>
              <div className="auto-text">
                <h3>First Available</h3>
                <p>Get the next available stylist for your appointment</p>
              </div>
            </div>

            <div className="stylists-grid">
              {stylists.map(stylist => (
                <div
                  key={stylist.id}
                  className={`stylist-option ${selectedStylist?.id === stylist.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStylist(stylist)}
                >
                  <img src={stylist.image} alt={stylist.name} className="stylist-img" />
                  <h3>{stylist.name}</h3>
                  <p className="stylist-rating">⭐ {stylist.rating}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="step-title">Select Date & Time</h2>

            <div className="date-section">
              <label>
                <FaCalendarAlt /> Choose a Date
              </label>
              <input
                type="date"
                className="date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="time-section">
              <label>
                <FaClock /> Choose a Time
              </label>
              <div className="time-slots">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="upload-section">
              <label>
                <FaUpload /> Reference Image (Optional)
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="image-upload"
                  className="upload-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload" className="upload-label">
                  {referenceImage ? (
                    <img src={referenceImage} alt="Reference" className="uploaded-preview" />
                  ) : (
                    <>
                      <div className="upload-icon">📷</div>
                      <p>Click to upload a reference image</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="notes-section">
              <label>
                <FaStickyNote /> Additional Notes (Optional)
              </label>
              <textarea
                className="notes-input"
                rows="4"
                placeholder="Any special requests or information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content confirmation">
            <div className="success-icon">
              <FaCheck />
            </div>
            <h2 className="step-title">Booking Confirmed!</h2>
            <p>Your appointment has been successfully booked</p>

            <div className="booking-summary-detail">
              <div className="summary-item">
                <div className="summary-icon">💇</div>
                <div>
                  <p className="summary-label">Service</p>
                  <p className="summary-value">{selectedService?.name}</p>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">👤</div>
                <div>
                  <p className="summary-label">Stylist</p>
                  <p className="summary-value">
                    {selectedStylist === 'auto' ? 'First Available' : selectedStylist?.name}
                  </p>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">📅</div>
                <div>
                  <p className="summary-label">Date & Time</p>
                  <p className="summary-value">
                    {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                  </p>
                </div>
              </div>

              {notes && (
                <div className="summary-item">
                  <div className="summary-icon">📝</div>
                  <div>
                    <p className="summary-label">Notes</p>
                    <p className="summary-notes">{notes}</p>
                  </div>
                </div>
              )}

              {referenceImage && (
                <div className="summary-item">
                  <div className="summary-icon">📷</div>
                  <div className="summary-image">
                    <p className="summary-label">Reference Image</p>
                    <img src={referenceImage} alt="Reference" />
                  </div>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button className="btn-confirm" onClick={() => navigate('/account')}>
                View My Bookings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* EN-TÊTE */}
      <section className="booking-header">
        <h1 className="page-title">Book an Appointment</h1>
        <p className="page-subtitle">Schedule your beauty treatment with our experts</p>
      </section>

      {/* STEPPER */}
      <section className="stepper-section">
        <div className="stepper">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Service</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Stylist</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Date & Time</span>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span className="step-label">Confirm</span>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="booking-content">
        <div className="booking-container">
          <div className="booking-main">
            {renderStepContent()}

            {currentStep < 4 && (
              <div className="step-actions">
                {currentStep > 1 && (
                  <button className="btn-back" onClick={goToPrevStep}>
                    Back
                  </button>
                )}
                {currentStep < 3 && (
                  <button
                    className="btn-next"
                    onClick={goToNextStep}
                    disabled={!isStepComplete()}
                  >
                    Continue →
                  </button>
                )}
                {currentStep === 3 && (
                  <button
                    className="btn-confirm"
                    onClick={handleConfirmBooking}
                    disabled={!isStepComplete()}
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RÉSUMÉ */}
          {currentStep < 4 && (
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              
              {selectedService && (
                <>
                  <div className="summary-row">
                    <span>Service</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Duration</span>
                    <span>{selectedService.duration} min</span>
                  </div>
                  <div className="summary-row">
                    <span>Price</span>
                    <span>{formatPrice(selectedService.priceFrom)}</span>
                  </div>
                </>
              )}

              {selectedStylist && (
                <div className="summary-row">
                  <span>Stylist</span>
                  <span>{selectedStylist === 'auto' ? 'First Available' : selectedStylist.name}</span>
                </div>
              )}

              {selectedDate && (
                <div className="summary-row">
                  <span>Date</span>
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
              )}

              {selectedTime && (
                <div className="summary-row">
                  <span>Time</span>
                  <span>{selectedTime}</span>
                </div>
              )}

              {selectedService && (
                <>
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span className="total-price">{formatPrice(selectedService.priceFrom)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Booking;