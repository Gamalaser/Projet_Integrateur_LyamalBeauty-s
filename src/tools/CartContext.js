// ========================================
// CART CONTEXT - GESTION DU PANIER
// ========================================
import React, { createContext, useContext, useState, useEffect } from 'react';

// Créer le Context
const CartContext = createContext();

// Hook personnalisé pour utiliser le panier
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider du panier
export const CartProvider = ({ children }) => {
  // État du panier (sauvegardé dans localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('lyamal_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem('lyamal_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Ajouter un produit au panier
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Vérifier si le produit existe déjà
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // Augmenter la quantité
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Ajouter le nouveau produit
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Retirer un produit du panier
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Mettre à jour la quantité d'un produit
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Augmenter la quantité
  const incrementQuantity = (productId) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Diminuer la quantité
  const decrementQuantity = (productId) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculer le nombre total d'articles
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculer le prix total
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Vérifier si un produit est dans le panier
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Obtenir la quantité d'un produit spécifique
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Valeurs et fonctions exposées
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;