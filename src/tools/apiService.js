// ========================================
// API SERVICE - Connexion à FIRESTORE
// (remplace json-server / localhost:5000)
// ========================================
import { db } from './firebaseConfig';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

// Helper : transforme un snapshot Firestore en tableau d'objets
const snapshotToArray = (snapshot) =>
  snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

// ========================================
// SERVICES
// ========================================
export const getServices = async () => {
  const snapshot = await getDocs(collection(db, 'services'));
  return snapshotToArray(snapshot);
};

export const getServiceById = async (id) => {
  const ref = doc(db, 'services', String(id));
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Service not found');
  return { id: snap.id, ...snap.data() };
};

export const getFilteredServices = async (filters) => {
  // Firestore filtre moins souplement que json-server :
  // on récupère tout puis on filtre côté client (volume faible).
  const all = await getServices();
  return all.filter((s) => {
    if (filters.category && filters.category !== 'All' && s.category !== filters.category) return false;
    if (filters.genre && filters.genre !== 'All' && s.genre !== filters.genre) return false;
    if (filters.search && !s.name?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};

// ========================================
// STYLISTS (COIFFEURS)
// ========================================
export const getStylists = async () => {
  const snapshot = await getDocs(collection(db, 'stylists'));
  return snapshotToArray(snapshot);
};

export const getStylistById = async (id) => {
  const ref = doc(db, 'stylists', String(id));
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Stylist not found');
  return { id: snap.id, ...snap.data() };
};

export const getFilteredStylists = async (filters) => {
  const all = await getStylists();
  return all.filter((s) => {
    if (filters.genre && filters.genre !== 'All' && s.genre !== filters.genre) return false;
    if (filters.specialty && filters.specialty !== 'All') {
      if (!s.specialties?.some((sp) => sp.includes(filters.specialty))) return false;
    }
    return true;
  });
};

// ========================================
// BOOKINGS (RÉSERVATIONS)
// ========================================
export const createBooking = async (bookingData) => {
  const docRef = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
  return { id: docRef.id, ...bookingData };
};

export const getBookings = async () => {
  const snapshot = await getDocs(collection(db, 'bookings'));
  return snapshotToArray(snapshot);
};

export const getClientBookings = async (clientId) => {
  const q = query(collection(db, 'bookings'), where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  return snapshotToArray(snapshot);
};

export const getStylistBookings = async (stylistId) => {
  const q = query(collection(db, 'bookings'), where('stylistId', '==', stylistId));
  const snapshot = await getDocs(q);
  return snapshotToArray(snapshot);
};

export const updateBooking = async (id, updatedData) => {
  const ref = doc(db, 'bookings', String(id));
  await updateDoc(ref, updatedData);
  return { id, ...updatedData };
};

export const deleteBooking = async (id) => {
  await deleteDoc(doc(db, 'bookings', String(id)));
  return true;
};

// ========================================
// PRODUCTS (PRODUITS)
// ========================================
export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshotToArray(snapshot);
};

export const getProductById = async (id) => {
  const ref = doc(db, 'products', String(id));
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Product not found');
  return { id: snap.id, ...snap.data() };
};

// ========================================
// REVIEWS (AVIS)
// ========================================
export const getReviews = async () => {
  const snapshot = await getDocs(collection(db, 'reviews'));
  return snapshotToArray(snapshot);
};

export const getStylistReviews = async (stylistId) => {
  const q = query(collection(db, 'reviews'), where('stylistId', '==', stylistId));
  const snapshot = await getDocs(q);
  return snapshotToArray(snapshot);
};

export const createReview = async (reviewData) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...reviewData };
};

// ========================================
// USERS (UTILISATEURS)
// ========================================
export const getUserById = async (id) => {
  const ref = doc(db, 'users', String(id));
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('User not found');
  return { id: snap.id, ...snap.data() };
};

export const createUser = async (userData) => {
  // On garde l'id Firebase Auth comme id du document (important !)
  const { id, ...rest } = userData;
  await setDoc(doc(db, 'users', String(id)), {
    ...rest,
    createdAt: userData.createdAt || new Date().toISOString(),
  });
  return userData;
};

export const updateUser = async (id, updatedData) => {
  const ref = doc(db, 'users', String(id));
  await updateDoc(ref, updatedData);
  return { id, ...updatedData };
};