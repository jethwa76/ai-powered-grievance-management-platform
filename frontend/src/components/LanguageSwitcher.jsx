import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'mr', label: 'म' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`lang-switcher ${className}`} role="group" aria-label="Select language">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          className={`lang-btn${lang === code ? ' active' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          title={code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'मराठी'}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
