
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCalendarAlt, FaClock, FaUser, FaUpload, FaStickyNote } from 'react-icons/fa';
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext';
import { getServices, getStylists, createBooking } from '../tools/apiService';
import '../styles/pages/booking.scss';

function Booking() {
  const { t } = useTranslation();
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
          <h1 className="page-title">{t('booking.title')}</h1>
          <p className="page-subtitle">{t('booking.subtitle')}</p>
        </section>

        <div className="auth-required-container">
          <div className="auth-required-card">
            <div className="auth-icon">
              <FaUser />
            </div>
            <h2>{t('booking.authRequired.title')}</h2>
            <p>{t('booking.authRequired.message')}</p>
            <div className="auth-buttons">
              <button 
                className="btn-login"
                onClick={() => navigate('/login', { state: { from: '/booking' } })}
              >
                {t('booking.authRequired.signIn')}
              </button>
              <button 
                className="btn-register"
                onClick={() => navigate('/register', { state: { from: '/booking' } })}
              >
                {t('booking.authRequired.createAccount')}
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

  // CONFIRMER LA RÉSERVATION
  const handleConfirmBooking = async () => {
    try {
      setLoading(true);

      const bookingData = {
        clientId: currentUser.uid,
        clientName: currentUser.displayName || currentUser.email,
        clientEmail: currentUser.email,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        stylistId: selectedStylist === 'auto' ? 'auto' : selectedStylist.id,
        stylistName: selectedStylist === 'auto' ? t('booking.step2.firstAvailable') : selectedStylist.name,
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        price: selectedService.priceFrom,
        notes: notes || ''
      };

      const result = await createBooking(bookingData);
      console.log('✅ Booking created successfully:', result);

      setCurrentStep(4);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('❌ Error creating booking:', error);
      alert(t('booking.error.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Rendu du contenu selon l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">{t('booking.step1.title')}</h2>
            <div className="services-grid">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <img src={service.image} alt={service.name} className="service-img" />
                  <h3>{service.name}</h3>
                  <p className="service-duration">{service.duration} {t('services.minutes')}</p>
                  <p className="service-price">{formatPrice(service.priceFrom)}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">{t('booking.step2.title')}</h2>
            
            <div
              className={`first-available ${selectedStylist === 'auto' ? 'selected' : ''}`}
              onClick={() => setSelectedStylist('auto')}
            >
              <div className="auto-icon">⚡</div>
              <div className="auto-text">
                <h3>{t('booking.step2.firstAvailable')}</h3>
                <p>{t('booking.step2.firstAvailableDesc')}</p>
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
            <h2 className="step-title">{t('booking.step3.title')}</h2>

            <div className="date-section">
              <label>
                <FaCalendarAlt /> {t('booking.step3.chooseDate')}
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
                <FaClock /> {t('booking.step3.chooseTime')}
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
                <FaUpload /> {t('booking.step3.referenceImage')}
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
                      <p>{t('booking.step3.uploadPrompt')}</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="notes-section">
              <label>
                <FaStickyNote /> {t('booking.step3.notes')}
              </label>
              <textarea
                className="notes-input"
                rows="4"
                placeholder={t('booking.step3.notesPlaceholder')}
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
            <h2 className="step-title">{t('booking.confirmation.title')}</h2>
            <p>{t('booking.confirmation.message')}</p>

            <div className="booking-summary-detail">
              <div className="summary-item">
                <div className="summary-icon">💇</div>
                <div>
                  <p className="summary-label">{t('booking.summary.service')}</p>
                  <p className="summary-value">{selectedService?.name}</p>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">👤</div>
                <div>
                  <p className="summary-label">{t('booking.summary.stylist')}</p>
                  <p className="summary-value">
                    {selectedStylist === 'auto' ? t('booking.step2.firstAvailable') : selectedStylist?.name}
                  </p>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">📅</div>
                <div>
                  <p className="summary-label">{t('booking.summary.dateTime')}</p>
                  <p className="summary-value">
                    {new Date(selectedDate).toLocaleDateString()} {t('booking.summary.at')} {selectedTime}
                  </p>
                </div>
              </div>

              {notes && (
                <div className="summary-item">
                  <div className="summary-icon">📝</div>
                  <div>
                    <p className="summary-label">{t('booking.summary.notes')}</p>
                    <p className="summary-notes">{notes}</p>
                  </div>
                </div>
              )}

              {referenceImage && (
                <div className="summary-item">
                  <div className="summary-icon">📷</div>
                  <div className="summary-image">
                    <p className="summary-label">{t('booking.summary.referenceImage')}</p>
                    <img src={referenceImage} alt="Reference" />
                  </div>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button className="btn-confirm" onClick={() => navigate('/account')}>
                {t('booking.confirmation.viewBookings')}
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
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* EN-TÊTE */}
      <section className="booking-header">
        <h1 className="page-title">{t('booking.title')}</h1>
        <p className="page-subtitle">{t('booking.subtitle')}</p>
      </section>

      {/* STEPPER */}
      <section className="stepper-section">
        <div className="stepper">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">{t('booking.stepper.service')}</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">{t('booking.stepper.stylist')}</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">{t('booking.stepper.dateTime')}</span>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span className="step-label">{t('booking.stepper.confirm')}</span>
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
                    {t('booking.navigation.back')}
                  </button>
                )}
                {currentStep < 3 && (
                  <button
                    className="btn-next"
                    onClick={goToNextStep}
                    disabled={!isStepComplete()}
                  >
                    {t('booking.navigation.continue')} →
                  </button>
                )}
                {currentStep === 3 && (
                  <button
                    className="btn-confirm"
                    onClick={handleConfirmBooking}
                    disabled={!isStepComplete()}
                  >
                    {t('booking.navigation.confirmBooking')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RÉSUMÉ */}
          {currentStep < 4 && (
            <div className="booking-summary">
              <h3>{t('booking.summary.title')}</h3>
              
              {selectedService && (
                <>
                  <div className="summary-row">
                    <span>{t('booking.summary.service')}</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>{t('booking.summary.duration')}</span>
                    <span>{selectedService.duration} {t('services.minutes')}</span>
                  </div>
                  <div className="summary-row">
                    <span>{t('booking.summary.price')}</span>
                    <span>{formatPrice(selectedService.priceFrom)}</span>
                  </div>
                </>
              )}

              {selectedStylist && (
                <div className="summary-row">
                  <span>{t('booking.summary.stylist')}</span>
                  <span>{selectedStylist === 'auto' ? t('booking.step2.firstAvailable') : selectedStylist.name}</span>
                </div>
              )}

              {selectedDate && (
                <div className="summary-row">
                  <span>{t('booking.summary.date')}</span>
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
              )}

              {selectedTime && (
                <div className="summary-row">
                  <span>{t('booking.summary.time')}</span>
                  <span>{selectedTime}</span>
                </div>
              )}

              {selectedService && (
                <>
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span>{t('booking.summary.total')}</span>
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