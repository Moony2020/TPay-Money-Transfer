import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Bottom Navigation Icons
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function BottomNav() {
  const { t } = useLanguage();

  const navItems = [
    { to: '/home', icon: HomeIcon, label: t('nav.home') },
    { to: '/history', icon: HistoryIcon, label: t('nav.history') },
    { to: '/send', icon: SendIcon, label: t('nav.send') },
    { to: '/profile', icon: ProfileIcon, label: t('nav.profile') },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-items">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
