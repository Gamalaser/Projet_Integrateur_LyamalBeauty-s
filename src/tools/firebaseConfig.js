// ========================================
// FIREBASE CONFIGURATION - LYAMAL BEAUTY'S
// ========================================
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Storage commenté pour l'instant (pas d'abonnement requis)
// import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC_D4f1rS4ktCDofPepTFAB9wrGF9CInno",
  authDomain: "lyamal-beautys.firebaseapp.com",
  projectId: "lyamal-beautys",
  storageBucket: "lyamal-beautys.firebasestorage.app",
  messagingSenderId: "683685956308",
  appId: "1:683685956308:web:2ba9b768680a51c3d20941",
  measurementId: "G-QS5HRCY7DD"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Storage désactivé pour l'instant (pas d'abonnement)
// export const storage = getStorage(app);
export const storage = null; // On met null pour éviter les erreurs

export default app;