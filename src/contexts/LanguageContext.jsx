import { useState } from 'react';
import PropTypes from 'prop-types';
import { LanguageContext } from './useLanguage';

// Language Provider Component
function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'id'; }
    catch { return 'id'; }
  });

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { LanguageProvider };
