import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'en', label: 'EN',  title: 'English' },
  { code: 'hi', label: 'हि',  title: 'हिन्दी' },
  { code: 'mr', label: 'म',   title: 'मराठी' },
  { code: 'gu', label: 'ગુ',  title: 'ગુજરાતી' },
  { code: 'ta', label: 'த',   title: 'தமிழ்' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`lang-switcher ${className}`} role="group" aria-label="Select language">
      {LANGS.map(({ code, label, title }) => (
        <button
          key={code}
          className={`lang-btn${lang === code ? ' active' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          title={title}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
