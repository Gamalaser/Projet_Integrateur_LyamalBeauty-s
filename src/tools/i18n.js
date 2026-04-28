// ========================================
// I18N CONFIGURATION - GESTION DES LANGUES
// ========================================
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationEN from '../locales/en.json';
import translationFR from '../locales/fr.json';

// Les ressources de traduction
const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  }
};

// Configuration d'i18next
i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du navigateur
  .use(initReactI18next) // Passe i18n à react-i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut si la détection échoue
    lng: localStorage.getItem('language') || 'fr', // Charge la langue sauvegardée ou FR par défaut
    
    interpolation: {
      escapeValue: false // React échappe déjà les valeurs
    },
    
    detection: {
      // Options de détection
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Sauvegarder la langue choisie dans localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;