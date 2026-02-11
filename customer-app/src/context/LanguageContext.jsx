import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, languages } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState(() => {
    return localStorage.getItem('tpay_lang') || 'en';
  });

  const lang = languages.find(l => l.code === langCode) || languages[0];
  const dir = lang.dir;

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', langCode);
    localStorage.setItem('tpay_lang', langCode);
  }, [langCode, dir]);

  const t = useCallback((keyPath) => {
    const keys = keyPath.split('.');
    let value = translations[langCode];
    
    for (const key of keys) {
      if (value && value[key]) {
        value = value[key];
      } else {
        // Fallback to English if key missing in current language
        let fallback = translations['en'];
        for (const fKey of keys) {
          if (fallback && fallback[fKey]) {
            fallback = fallback[fKey];
          } else {
            return keyPath; // Return key path if missing in English too
          }
        }
        return fallback;
      }
    }
    return value;
  }, [langCode]);

  const changeLanguage = (code) => {
    setLangCode(code);
  };

  const currentLanguage = languages.find(l => l.code === langCode) || languages[0];

  return (
    <LanguageContext.Provider value={{ langCode, dir, t, changeLanguage, currentLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
