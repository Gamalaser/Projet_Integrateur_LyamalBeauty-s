// ========================================
// CURRENCY CONTEXT - GESTION DES DEVISES
// ========================================
import React, { createContext, useContext, useState, useEffect } from 'react';

// Taux de conversion (USD = base 1.00)
const EXCHANGE_RATES = {
  USD: 1.00,      // Dollar américain (base)
  EUR: 0.92,      // Euro
  CAD: 1.36,      // Dollar canadien
  GBP: 0.79       // Livre sterling
};

// Symboles de devises
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  CAD: 'CAD$',
  GBP: '£'
};

// Drapeaux (émojis)
const CURRENCY_FLAGS = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  CAD: '🇨🇦',
  GBP: '🇬🇧'
};

// Noms complets
const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  CAD: 'Canadian Dollar',
  GBP: 'British Pound'
};

// Créer le contexte
const CurrencyContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

// Provider du contexte
export const CurrencyProvider = ({ children }) => {
  // État de la devise actuelle (récupéré du localStorage ou USD par défaut)
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('lyamal-currency');
    return saved || 'USD';
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('lyamal-currency', currency);
  }, [currency]);

  // Fonction pour convertir un prix
  const convertPrice = (priceUSD) => {
    const rate = EXCHANGE_RATES[currency];
    return priceUSD * rate;
  };

  // Fonction pour formater un prix avec le symbole
  const formatPrice = (priceUSD) => {
    const convertedPrice = convertPrice(priceUSD);
    const symbol = CURRENCY_SYMBOLS[currency];
    
    // Formater avec 2 décimales
    const formatted = convertedPrice.toFixed(2);
    
    // Pour CAD$, mettre le symbole après
    if (currency === 'CAD') {
      return `${formatted} ${symbol}`;
    }
    
    // Pour les autres, mettre le symbole avant
    return `${symbol}${formatted}`;
  };

  // Fonction pour changer la devise
  const changeCurrency = (newCurrency) => {
    if (EXCHANGE_RATES[newCurrency]) {
      setCurrency(newCurrency);
    }
  };

  // Obtenir les informations de la devise actuelle
  const getCurrencyInfo = () => ({
    code: currency,
    symbol: CURRENCY_SYMBOLS[currency],
    flag: CURRENCY_FLAGS[currency],
    name: CURRENCY_NAMES[currency],
    rate: EXCHANGE_RATES[currency]
  });

  // Obtenir toutes les devises disponibles
  const getAvailableCurrencies = () => {
    return Object.keys(EXCHANGE_RATES).map(code => ({
      code,
      symbol: CURRENCY_SYMBOLS[code],
      flag: CURRENCY_FLAGS[code],
      name: CURRENCY_NAMES[code],
      rate: EXCHANGE_RATES[code]
    }));
  };

  const value = {
    currency,
    changeCurrency,
    convertPrice,
    formatPrice,
    getCurrencyInfo,
    getAvailableCurrencies
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;