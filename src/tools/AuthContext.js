// ========================================
// AUTH CONTEXT - GESTION DE L'AUTHENTIFICATION
// ========================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import app from './firebaseConfig'; // Import de l'app Firebase
import { createUser, getUserById } from './apiService'; // ✅ AJOUTÉ pour sauvegarder dans db.json

// Créer le Context
const AuthContext = createContext();

// Hook personnalisé pour utiliser l'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider de l'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialiser Firebase Auth avec l'app
  const auth = getAuth(app);

  // ✅ S'inscrire avec email et mot de passe (CORRIGÉ)
  const signup = async (email, password, displayName, role = 'client') => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour le profil avec le nom
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Stocker le rôle dans localStorage
      localStorage.setItem(`user_role_${userCredential.user.uid}`, role);

      // ✅ NOUVEAU : Sauvegarder l'utilisateur dans db.json
      try {
        await createUser({
          id: userCredential.user.uid,
          email: email,
          name: displayName,
          role: role,
          phone: '', // Peut être ajouté plus tard
          createdAt: new Date().toISOString()
        });
        console.log('✅ User saved to db.json');
      } catch (dbError) {
        console.error('⚠️ Failed to save user to db.json:', dbError);
        // On continue même si db.json échoue (Firebase est la source de vérité)
      }

      return { user: userCredential.user, role };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ✅ Se connecter avec email et mot de passe (CORRIGÉ)
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Récupérer le rôle depuis localStorage
      const role = localStorage.getItem(`user_role_${userCredential.user.uid}`) || 'client';
      
      // ✅ NOUVEAU : Vérifier si l'user existe dans db.json, sinon le créer
      try {
        await getUserById(userCredential.user.uid);
        console.log('✅ User exists in db.json');
      } catch (dbError) {
        // Si l'user n'existe pas dans db.json, le créer
        console.log('⚠️ User not found in db.json, creating...');
        try {
          await createUser({
            id: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName || email.split('@')[0],
            role: role,
            phone: '',
            createdAt: new Date().toISOString()
          });
          console.log('✅ User created in db.json');
        } catch (createError) {
          console.error('⚠️ Failed to create user in db.json:', createError);
        }
      }
      
      return { user: userCredential.user, role };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ✅ Se connecter avec Google (CORRIGÉ)
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Par défaut, un utilisateur Google est un client
      const role = localStorage.getItem(`user_role_${userCredential.user.uid}`) || 'client';
      localStorage.setItem(`user_role_${userCredential.user.uid}`, role);
      
      // ✅ NOUVEAU : Vérifier/créer dans db.json
      try {
        await getUserById(userCredential.user.uid);
        console.log('✅ Google user exists in db.json');
      } catch (dbError) {
        console.log('⚠️ Google user not found in db.json, creating...');
        try {
          await createUser({
            id: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName || 'Google User',
            role: role,
            phone: '',
            createdAt: new Date().toISOString()
          });
          console.log('✅ Google user created in db.json');
        } catch (createError) {
          console.error('⚠️ Failed to create Google user in db.json:', createError);
        }
      }
      
      return { user: userCredential.user, role };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Se déconnecter
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Réinitialiser le mot de passe
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Mettre à jour le profil
  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        setCurrentUser({ ...auth.currentUser });
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Obtenir le rôle de l'utilisateur
  const getUserRole = (userId = null) => {
    // Si pas d'userId fourni, utiliser currentUser
    const id = userId || (currentUser ? currentUser.uid : null);
    if (!id) return 'client';
    return localStorage.getItem(`user_role_${id}`) || 'client';
  };

  // Vérifier si l'utilisateur est un coiffeur (stylist)
  const isCoiffeur = () => {
    if (!currentUser) return false;
    return currentUser.role === 'stylist';
  };

  // Vérifier si l'utilisateur est un admin
  const isAdmin = () => {
    if (!currentUser) return false;
    return currentUser.role === 'admin';
  };

  // ========================================
  // ✅ Ajouter le rôle dans currentUser
  // ========================================
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Récupérer le rôle depuis localStorage
        const role = localStorage.getItem(`user_role_${user.uid}`) || 'client';
        
        // ✅ IMPORTANT : Créer un objet currentUser avec le rôle inclus
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: role // ← LE RÔLE EST MAINTENANT DANS currentUser
        });
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false); // ✅ IMPORTANT : Fin du chargement
    });

    // Cleanup
    return unsubscribe;
  }, [auth]);

  // Valeurs et fonctions exposées
  const value = {
    currentUser,
    loading, // ✅ IMPORTANT pour ProtectedRoute
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    getUserRole,
    isCoiffeur,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;