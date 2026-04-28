
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../tools/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaGoogle, FaUserTie, FaCut } from 'react-icons/fa';
import '../styles/components/register.scss';

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' //  'client' ou 'stylist'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Gérer les changements dans les inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };
  
  // Sélectionner le rôle (Client ou Stylist)
  const selectRole = (role) => {
    setFormData({
      ...formData,
      role: role
    });
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t('auth.errors.fillAllFields'));
      return;
    }
    
    if (formData.password.length < 6) {
      setError(t('auth.errors.weakPassword'));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signup(formData.email, formData.password, formData.name, formData.role);
      
      console.log(' Signup successful, role:', result.role);
      
      // Rediriger selon le rôle
      if (result.role === 'stylist') {
        console.log('→ Redirecting to /coiffeur-dashboard');
        navigate('/coiffeur-dashboard', { replace: true });
      } else {
        console.log('→ Redirecting to /');
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Messages d'erreur personnalisés
      if (err.message.includes('email-already-in-use')) {
        setError(t('auth.errors.emailInUse'));
      } else if (err.message.includes('invalid-email')) {
        setError(t('auth.errors.fillAllFields'));
      } else if (err.message.includes('weak-password')) {
        setError(t('auth.errors.weakPassword'));
      } else {
        setError(t('auth.errors.registerFailed'));
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Connexion avec Google
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google signup error:', err);
      setError(t('auth.errors.googleLoginFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-page">
      <div className="register-container">
        
        <div className="register-header">
          <h1 className="register-title">{t('auth.register.title')}</h1>
          <p className="register-subtitle">{t('auth.register.subtitle')}</p>
        </div>
        
        {/* Sélection du rôle */}
        <div className="role-selection">
          <h3 className="role-title">{t('auth.register.roleLabel')}:</h3>
          <div className="role-options">
            
            {/* Option Client */}
            <div 
              className={`role-card ${formData.role === 'client' ? 'selected' : ''}`}
              onClick={() => selectRole('client')}
            >
              <div className="role-icon">
                <FaUserTie />
              </div>
              <h4 className="role-name">{t('auth.register.client')}</h4>
              <p className="role-description">{t('auth.register.clientDesc')}</p>
            </div>
            
            {/* Option Stylist */}
            <div 
              className={`role-card ${formData.role === 'stylist' ? 'selected' : ''}`}
              onClick={() => selectRole('stylist')}
            >
              <div className="role-icon">
                <FaCut />
              </div>
              <h4 className="role-name">{t('auth.register.stylist')}</h4>
              <p className="role-description">{t('auth.register.stylistDesc')}</p>
            </div>
            
          </div>
        </div>
        
        {/* Afficher les erreurs */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Formulaire d'inscription */}
        <form className="register-form" onSubmit={handleSubmit}>
          
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">{t('auth.register.fullNameLabel')}</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.register.fullNamePlaceholder')}
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">{t('auth.register.emailLabel')}</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.register.emailPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">{t('auth.register.passwordLabel')}</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.register.passwordPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.register.confirmPasswordLabel')}</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-register-submit"
            disabled={loading}
          >
            {loading ? t('auth.register.signingUp') : t('auth.register.signUp')}
          </button>
          
        </form>
        
        {/* Divider */}
        <div className="divider">
          <span>{t('auth.register.or')}</span>
        </div>
        
        {/* Google Signup */}
        <button 
          className="btn-google-signup"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <FaGoogle className="google-icon" />
          {t('auth.register.continueWithGoogle')}
        </button>
        
        {/* Login Link */}
        <div className="login-prompt">
          {t('auth.register.haveAccount')} <Link to="/login" className="login-link">{t('auth.register.signInLink')}</Link>
        </div>
        
      </div>
    </div>
  );
}

export default Register;