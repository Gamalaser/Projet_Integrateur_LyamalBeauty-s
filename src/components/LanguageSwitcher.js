// ici nous avons créé un composant LanguageSwitcher pour permettre aux utilisateurs de changer la langue de l'interface,
// en utilisant le hook useTranslation de react-i18next pour gérer les traductions, 
// et nous avons ajouté un menu déroulant pour sélectionner la langue, avec des drapeaux et des noms de langues.
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import '../styles/components/languageswitcher.scss';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  // ici nous avons défini les langues disponibles dans une liste avec leur code, leur nom et leur drapeau,
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];
  
  // ici nous avons trouvé la langue actuelle en fonction du code de langue dans i18n, 
  // et nous avons utilisé cette information pour afficher le drapeau et le nom de la langue actuelle dans le sélecteur de langue du header.
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  // ici nous avons créé une fonction changeLanguage pour changer la langue de l'interface en appelant la méthode changeLanguage de i18n avec le code de la langue sélectionnée.
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowMenu(false);
  };
  
  // ici nous avons ajouté un effet pour fermer le menu déroulant de sélection de langue lorsque l'utilisateur clique en dehors de celui-ci,
  // en utilisant une référence pour détecter les clics à l'extérieur du menu.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="language-switcher" ref={menuRef}>
      <div 
        className="language-selector"
        onClick={() => setShowMenu(!showMenu)}
      >
        <FaGlobe className="globe-icon" />
        <div className="current-language">
          <span className="flag">{currentLanguage.flag}</span>
          <span className="language-name">{currentLanguage.name}</span>
        </div>
        <span className={`dropdown-arrow ${showMenu ? 'open' : ''}`}>▼</span>
      </div>
      
      {showMenu && (
        <div className="language-dropdown open">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`language-option ${lang.code === currentLanguage.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;