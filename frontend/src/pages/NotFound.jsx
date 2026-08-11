import { Link } from 'react-router-dom';
import { useT } from '../context/LanguageContext';

export default function NotFound() {
  const t = useT();
  return (
    <div className="not-found">
      <div className="brand">
        <span className="brand-mark">✦</span>
        <span>Civic<span>Flow</span></span>
      </div>
      <div className="not-found-number">404</div>
      <h1>{t('nf_h1')}</h1>
      <p>{t('nf_p')}</p>
      <Link to="/" className="button primary">{t('nav_back_home')}</Link>
    </div>
  );
}
