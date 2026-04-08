// ========================================
// REGISTER.JS - PAGE D'INSCRIPTION
// VERSION CORRIGÉE : "stylist" au lieu de "coiffeur" ✅
// ========================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../tools/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaGoogle, FaUserTie, FaCut } from 'react-icons/fa';
import '../styles/components/register.scss';

function Register() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' // ✅ 'client' ou 'stylist' (plus de "coiffeur")
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
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await signup(formData.email, formData.password, formData.name, formData.role);
      
      // ✅ Rediriger selon le rôle (stylist au lieu de coiffeur)
      if (formData.role === 'stylist') {
        navigate('/coiffeur-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Messages d'erreur personnalisés
      if (err.message.includes('email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (err.message.includes('invalid-email')) {
        setError('Invalid email address');
      } else if (err.message.includes('weak-password')) {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
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
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-page">
      <div className="register-container">
        
        <div className="register-header">
          <h1 className="register-title">Create Your Account</h1>
          <p className="register-subtitle">Join LYAMAL BEAUTY'S and start your journey</p>
        </div>
        
        {/* Sélection du rôle */}
        <div className="role-selection">
          <h3 className="role-title">I want to join as:</h3>
          <div className="role-options">
            
            {/* Option Client */}
            <div 
              className={`role-card ${formData.role === 'client' ? 'selected' : ''}`}
              onClick={() => selectRole('client')}
            >
              <div className="role-icon">
                <FaUserTie />
              </div>
              <h4 className="role-name">Client</h4>
              <p className="role-description">Book beauty services with professionals</p>
            </div>
            
            {/* ✅ Option Stylist (plus de "Coiffeur") */}
            <div 
              className={`role-card ${formData.role === 'stylist' ? 'selected' : ''}`}
              onClick={() => selectRole('stylist')}
            >
              <div className="role-icon">
                <FaCut />
              </div>
              <h4 className="role-name">Professional</h4>
              <p className="role-description">Offer your services and grow your business</p>
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
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
        </form>
        
        {/* Divider */}
        <div className="divider">
          <span>OR</span>
        </div>
        
        {/* Google Signup */}
        <button 
          className="btn-google-signup"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <FaGoogle className="google-icon" />
          Continue with Google
        </button>
        
        {/* Login Link */}
        <div className="login-prompt">
          Already have an account? <Link to="/login" className="login-link">Sign In</Link>
        </div>
        
      </div>
    </div>
  );
}

export default Register;