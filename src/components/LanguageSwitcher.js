// ========================================
// LANGUAGE SWITCHER - CHANGEMENT DE LANGUE
// ========================================
import React, { useState } from 'react';
import { FaGlobe } from 'react-icons/fa';
import '../styles/components/languageswitcher.scss';

function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('FR');
  
  const toggleLanguage = () => {
    const newLang = currentLang === 'FR' ? 'EN' : 'FR';
    setCurrentLang(newLang);
    
    // Plus tard, on utilisera i18next ici
    console.log('Language changed to:', newLang);
  };
  
  return (
    <div className="language-switcher" onClick={toggleLanguage}>
      <FaGlobe className="globe-icon" />
      <span className="lang-text">{currentLang}</span>
    </div>
  );
}

export default LanguageSwitcher;