// ========================================
// PROTECTEDROUTE.JS - COMPOSANT DE SÉCURITÉ
// Protège les routes selon l'authentification et le rôle
// ========================================
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../tools/AuthContext';

/**
 * Composant ProtectedRoute
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Composant à afficher si autorisé
 * @param {string} props.requiredRole - Rôle requis : 'client', 'stylist', ou null (juste connecté)
 * @param {string} props.redirectTo - URL de redirection si non autorisé (défaut: '/login')
 */
function ProtectedRoute({ children, requiredRole = null, redirectTo = '/login' }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Pendant le chargement de l'auth, afficher un spinner
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="spinner"></div>
        <p>Verifying access...</p>
        <style>{`
          .protected-route-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f5f5f5;
          }
          .protected-route-loading .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #d4af37;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .protected-route-loading p {
            margin-top: 1rem;
            color: #2d2d2d;
            font-size: 1.1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // CAS 1 : Utilisateur non connecté
  if (!currentUser) {
    // Rediriger vers login avec l'URL d'origine pour retourner après connexion
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // CAS 2 : Vérification du rôle si requis
  if (requiredRole) {
    const userRole = currentUser.role || 'client'; // Par défaut client si pas de rôle

    // Si le rôle requis ne correspond pas au rôle de l'utilisateur
    if (userRole !== requiredRole) {
      // Rediriger selon le rôle
      if (userRole === 'stylist') {
        // Coiffeur qui essaie d'accéder à une page client → Dashboard coiffeur
        return <Navigate to="/coiffeur-dashboard" replace />;
      } else {
        // Client qui essaie d'accéder à une page coiffeur → Account
        return <Navigate to="/account" replace />;
      }
    }
  }

  // CAS 3 : Tout est OK, afficher le composant
  return children;
}

export default ProtectedRoute;