// ========================================
// LOGIN.JS - PAGE DE CONNEXION
// VERSION AVEC REDIRECTION AUTOMATIQUE 
// ========================================
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../tools/AuthContext';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import '../styles/components/login.scss';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const result = await login(formData.email, formData.password);
      
      //  REDIRECTION AUTOMATIQUE SELON LE RÔLE
      // Si l'utilisateur venait d'une page protégée, y retourner
      const from = location.state?.from || null;
      
      if (from) {
        // Retourner à la page d'origine
        navigate(from);
      } else {
        // Sinon, rediriger selon le rôle
        if (result.role === 'stylist') {
          navigate('/coiffeur-dashboard'); //  Professionnel → Dashboard
        } else {
          navigate('/'); //  Client → Home
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      // Messages d'erreur personnalisés
      if (err.message.includes('user-not-found') || err.message.includes('wrong-password')) {
        setError('Invalid email or password');
      } else if (err.message.includes('too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Connexion avec Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await loginWithGoogle();
      
      // REDIRECTION AUTOMATIQUE SELON LE RÔLE
      const from = location.state?.from || null;
      
      if (from) {
        navigate(from);
      } else {
        if (result.role === 'stylist') {
          navigate('/coiffeur-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your LYAMAL BEAUTY'S account</p>
        </div>
        
        {/* Afficher les erreurs */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Formulaire de connexion */}
        <form className="login-form" onSubmit={handleSubmit}>
          
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
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Forgot Password Link */}
          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">
              Forgot your password?
            </Link>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-login-submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
        </form>
        
        {/* Divider */}
        <div className="divider">
          <span>OR</span>
        </div>
        
        {/* Google Login */}
        <button 
          className="btn-google-login"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle className="google-icon" />
          Continue with Google
        </button>
        
        {/* Register Link */}
        <div className="register-prompt">
          Don't have an account? <Link to="/register" className="register-link">Sign Up</Link>
        </div>
        
      </div>
    </div>
  );
}

export default Login;