import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import BackButton from '../components/BackButton';

export default function LanguageSettingsPage() {
  const navigate = useNavigate();
  const { langCode, languages, changeLanguage, t } = useLanguage();

  const handleSelect = (code) => {
    changeLanguage(code);
    setTimeout(() => {
      navigate('/profile');
    }, 300);
  };

  return (
    <div className="page">
      <header className="page-header">
        <BackButton />
        <h1 className="page-title">{t('language.title')}</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="page-content">
        <p className="text-caption mb-md px-xs">{t('language.select')}</p>
        
        <div className="card" style={{ padding: 0 }}>
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              className="flex-between w-full"
              onClick={() => handleSelect(lang.code)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px',
                borderBottom: index < languages.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                textAlign: 'inherit'
              }}
            >
              <span className="flex gap-md" style={{ alignItems: 'center' }}>
                <div 
                  className="flex-center" 
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    background: 'var(--bg-secondary)',
                    flexShrink: 0
                  }}
                >
                  <img 
                    src={`https://flagcdn.com/w80/${lang.region}.png`} 
                    alt={lang.name}
                    style={{ 
                      width: '120%', 
                      height: '120%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                </div>
                <span className="text-body" style={{ fontWeight: langCode === lang.code ? 600 : 400 }}>
                  {lang.name}
                </span>
              </span>
              {langCode === lang.code && (
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
