// ========================================
// BOOKING.JS - PAGE DE RÉSERVATION
// ========================================
import React, { useState, useEffect } from 'react';
import { FaCheck, FaUpload, FaCalendarAlt, FaClock, FaUser, FaCut } from 'react-icons/fa';
import { getServices, getStylists } from '../tools/apiService';
import '../styles/pages/booking.scss';

// ========================================
// COMPOSANT BOOKING PAGE
// ========================================
function Booking() {
  // États pour les données de l'API
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour l'étape actuelle (1 à 4)
  const [currentStep, setCurrentStep] = useState(1);
  
  // États pour les sélections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [notes, setNotes] = useState('');

  // Créneaux horaires disponibles
  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  // Charger les données depuis l'API au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Charger les services et les coiffeurs en parallèle
        const [servicesData, stylistsData] = await Promise.all([
          getServices(),
          getStylists()
        ]);
        setServices(servicesData);
        setStylists(stylistsData);
        setError(null);
      } catch (err) {
        console.error('Error loading booking data:', err);
        setError('Failed to load booking data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gérer l'upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Navigation entre étapes
  const goToNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Calculer le prix total
  const totalPrice = selectedService ? selectedService.priceFrom : 0;

  // Afficher spinner pendant le chargement
  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading booking options...</p>
        </div>
      </div>
    );
  }

  // Afficher erreur si problème
  if (error) {
    return (
      <div className="booking-page">
        <div className="error-container">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      
      {/* EN-TÊTE */}
      <section className="booking-header">
        <h1 className="page-title">Book Your Appointment</h1>
        <p className="page-subtitle">Follow the steps to reserve your perfect service</p>
      </section>

      {/* STEPPER - Indicateur d'étapes */}
      <section className="stepper-section">
        <div className="stepper">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
              <div className="step-number">
                {currentStep > step ? <FaCheck /> : step}
              </div>
              <div className="step-label">
                {step === 1 && 'Service'}
                {step === 2 && 'Stylist'}
                {step === 3 && 'Date & Time'}
                {step === 4 && 'Confirm'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="booking-content">
        <div className="booking-container">
          
          {/* ZONE PRINCIPALE - Étapes */}
          <div className="booking-main">
            
            {/* ÉTAPE 1 : SÉLECTION DU SERVICE */}
            {currentStep === 1 && (
              <div className="step-content">
                <h2 className="step-title">Choose Your Service</h2>
                <div className="services-grid">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                      onClick={() => setSelectedService(service)}
                    >
                      <img src={service.image} alt={service.name} className="service-img" />
                      <h3>{service.name}</h3>
                      <p className="service-duration">{service.duration} min</p>
                      <p className="service-price">${service.priceFrom}</p>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn-next" 
                  onClick={goToNextStep}
                  disabled={!selectedService}
                >
                  Continue
                </button>
              </div>
            )}

            {/* ÉTAPE 2 : SÉLECTION DU COIFFEUR */}
            {currentStep === 2 && (
              <div className="step-content">
                <h2 className="step-title">Choose Your Stylist</h2>
                
                {/* Option "Premier disponible" */}
                <div
                  className={`stylist-option first-available ${selectedStylist === 'auto' ? 'selected' : ''}`}
                  onClick={() => setSelectedStylist('auto')}
                >
                  <div className="auto-icon">🎲</div>
                  <div className="auto-text">
                    <h3>First Available</h3>
                    <p>Let us choose the best stylist for you</p>
                  </div>
                </div>

                {/* Liste des coiffeurs */}
                <div className="stylists-grid">
                  {stylists.map((stylist) => (
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

                <div className="step-actions">
                  <button className="btn-back" onClick={goToPreviousStep}>Back</button>
                  <button 
                    className="btn-next" 
                    onClick={goToNextStep}
                    disabled={!selectedStylist}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : DATE, HEURE ET DÉTAILS */}
            {currentStep === 3 && (
              <div className="step-content">
                <h2 className="step-title">Select Date & Time</h2>
                
                {/* Calendrier simplifié */}
                <div className="date-section">
                  <label><FaCalendarAlt /> Select Date</label>
                  <input
                    type="date"
                    className="date-input"
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Créneaux horaires */}
                {selectedDate && (
                  <div className="time-section">
                    <label><FaClock /> Available Time Slots</label>
                    <div className="time-slots">
                      {timeSlots.map((time) => (
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
                )}

                {/* Upload image de référence */}
                <div className="upload-section">
                  <label><FaUpload /> Reference Image (Optional)</label>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="upload-input"
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Reference" className="uploaded-preview" />
                      ) : (
                        <>
                          <FaUpload className="upload-icon" />
                          <p>Click to upload a reference image</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="notes-section">
                  <label>Special Notes (Optional)</label>
                  <textarea
                    className="notes-input"
                    placeholder="Any special requests or allergies..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                  />
                </div>

                <div className="step-actions">
                  <button className="btn-back" onClick={goToPreviousStep}>Back</button>
                  <button 
                    className="btn-next" 
                    onClick={goToNextStep}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : CONFIRMATION */}
            {currentStep === 4 && (
              <div className="step-content confirmation">
                <div className="success-icon">✓</div>
                <h2 className="step-title">Confirm Your Booking</h2>
                
                <div className="booking-summary-detail">
                  <div className="summary-item">
                    <FaCut className="summary-icon" />
                    <div>
                      <p className="summary-label">Service</p>
                      <p className="summary-value">{selectedService?.name}</p>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <FaUser className="summary-icon" />
                    <div>
                      <p className="summary-label">Stylist</p>
                      <p className="summary-value">
                        {selectedStylist === 'auto' ? 'First Available' : selectedStylist?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <FaCalendarAlt className="summary-icon" />
                    <div>
                      <p className="summary-label">Date & Time</p>
                      <p className="summary-value">{selectedDate} at {selectedTime}</p>
                    </div>
                  </div>

                  {uploadedImage && (
                    <div className="summary-item">
                      <div className="summary-image">
                        <img src={uploadedImage} alt="Reference" />
                      </div>
                    </div>
                  )}

                  {notes && (
                    <div className="summary-item">
                      <p className="summary-label">Notes</p>
                      <p className="summary-notes">{notes}</p>
                    </div>
                  )}
                </div>

                <div className="step-actions">
                  <button className="btn-back" onClick={goToPreviousStep}>Back</button>
                  <button className="btn-confirm">Confirm & Pay ${totalPrice}</button>
                </div>
              </div>
            )}

          </div>

          {/* RÉSUMÉ STICKY À DROITE */}
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            
            {selectedService && (
              <div className="summary-row">
                <span>Service:</span>
                <span>{selectedService.name}</span>
              </div>
            )}
            
            {selectedStylist && (
              <div className="summary-row">
                <span>Stylist:</span>
                <span>{selectedStylist === 'auto' ? 'Auto' : selectedStylist.name}</span>
              </div>
            )}
            
            {selectedDate && (
              <div className="summary-row">
                <span>Date:</span>
                <span>{selectedDate}</span>
              </div>
            )}
            
            {selectedTime && (
              <div className="summary-row">
                <span>Time:</span>
                <span>{selectedTime}</span>
              </div>
            )}
            
            <div className="summary-divider"></div>
            
            <div className="summary-total">
              <span>Total:</span>
              <span className="total-price">${totalPrice}</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Booking;