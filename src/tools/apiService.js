// ========================================
// API SERVICE - Connexion à JSON Server
// ========================================

const API_BASE_URL = 'http://localhost:5000';

// ========================================
// SERVICES
// ========================================

// Récupérer tous les services
export const getServices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Récupérer un service par ID
export const getServiceById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}`);
    if (!response.ok) throw new Error('Failed to fetch service');
    return await response.json();
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

// Filtrer les services
export const getFilteredServices = async (filters) => {
  try {
    let url = `${API_BASE_URL}/services?`;
    
    if (filters.category && filters.category !== 'All') {
      url += `category=${filters.category}&`;
    }
    if (filters.genre && filters.genre !== 'All') {
      url += `genre=${filters.genre}&`;
    }
    if (filters.search) {
      url += `name_like=${filters.search}&`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch filtered services');
    return await response.json();
  } catch (error) {
    console.error('Error fetching filtered services:', error);
    throw error;
  }
};

// ========================================
// STYLISTS (COIFFEURS)
// ========================================

// Récupérer tous les coiffeurs
export const getStylists = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stylists`);
    if (!response.ok) throw new Error('Failed to fetch stylists');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stylists:', error);
    throw error;
  }
};

// Récupérer un coiffeur par ID
export const getStylistById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stylists/${id}`);
    if (!response.ok) throw new Error('Failed to fetch stylist');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stylist:', error);
    throw error;
  }
};

// Filtrer les coiffeurs
export const getFilteredStylists = async (filters) => {
  try {
    let url = `${API_BASE_URL}/stylists?`;
    
    if (filters.genre && filters.genre !== 'All') {
      url += `genre=${filters.genre}&`;
    }
    if (filters.specialty && filters.specialty !== 'All') {
      url += `specialties_like=${filters.specialty}&`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch filtered stylists');
    return await response.json();
  } catch (error) {
    console.error('Error fetching filtered stylists:', error);
    throw error;
  }
};

// ========================================
// BOOKINGS (RÉSERVATIONS)
// ========================================

// Créer une réservation
export const createBooking = async (bookingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...bookingData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }),
    });
    
    if (!response.ok) throw new Error('Failed to create booking');
    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Récupérer toutes les réservations
export const getBookings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Récupérer les réservations d'un client
export const getClientBookings = async (clientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings?clientId=${clientId}`);
    if (!response.ok) throw new Error('Failed to fetch client bookings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    throw error;
  }
};

// Récupérer les réservations d'un coiffeur
export const getStylistBookings = async (stylistId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings?stylistId=${stylistId}`);
    if (!response.ok) throw new Error('Failed to fetch stylist bookings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stylist bookings:', error);
    throw error;
  }
};

// Mettre à jour une réservation
export const updateBooking = async (id, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) throw new Error('Failed to update booking');
    return await response.json();
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

// Supprimer une réservation
export const deleteBooking = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete booking');
    return true;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// ========================================
// PRODUCTS (PRODUITS)
// ========================================

// Récupérer tous les produits
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Récupérer un produit par ID
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// ========================================
// REVIEWS (AVIS)
// ========================================

// Récupérer tous les avis
export const getReviews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Récupérer les avis d'un coiffeur
export const getStylistReviews = async (stylistId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews?stylistId=${stylistId}`);
    if (!response.ok) throw new Error('Failed to fetch stylist reviews');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stylist reviews:', error);
    throw error;
  }
};

// Créer un avis
export const createReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...reviewData,
        createdAt: new Date().toISOString()
      }),
    });
    
    if (!response.ok) throw new Error('Failed to create review');
    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// ========================================
// USERS (UTILISATEURS)
// ========================================

// Récupérer un utilisateur par ID
export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Créer un utilisateur
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        createdAt: new Date().toISOString()
      }),
    });
    
    if (!response.ok) throw new Error('Failed to create user');
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};