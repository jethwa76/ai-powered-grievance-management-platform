import { createContext, useContext, useState } from 'react';
import en from '../locales/en';
import hi from '../locales/hi';
import mr from '../locales/mr';

const locales = { en, hi, mr };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('lang') || 'en'
  );

  const setLang = (code) => {
    localStorage.setItem('lang', code);
    setLangState(code);
  };

  const t = (key) => locales[lang]?.[key] ?? locales.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Shorthand — returns only the translation function */
export function useT() {
  return useContext(LanguageContext).t;
}
