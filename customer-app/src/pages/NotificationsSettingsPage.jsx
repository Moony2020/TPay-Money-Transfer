import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import BackButton from '../components/BackButton';

export default function NotificationsSettingsPage() {
  const { t } = useLanguage();
  const { markAsRead } = useNotification();
  const [settings, setSettings] = useState({
    transactions: true,
    security: true,
    promo: false,
    updates: true
  });

  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationItems = [
    { key: 'transactions', label: t('notifications.transactionAlerts') },
    { key: 'security', label: t('notifications.securityAlerts') },
    { key: 'promo', label: t('notifications.promoNotifications') },
    { key: 'updates', label: t('notifications.updates') }
  ];

  return (
    <div className="page">
      <header className="page-header">
        <BackButton />
        <h1 className="page-title">{t('notifications.title')}</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="page-content">
        <div className="card" style={{ padding: 0 }}>
          {notificationItems.map((item, index) => (
            <div
              key={item.key}
              className="flex-between w-full"
              style={{
                padding: '20px 16px',
                borderBottom: index < notificationItems.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <span className="text-body">{item.label}</span>
              <button
                className={`theme-toggle ${settings[item.key] ? 'active' : ''}`}
                onClick={() => toggleSetting(item.key)}
                aria-label={`Toggle ${item.label}`}
              />
            </div>
          ))}
        </div>
        
        <p className="text-caption mt-lg px-xs" style={{ textAlign: 'center', opacity: 0.7 }}>
          Manage how you receive alerts and updates from tPay.
        </p>
      </div>
    </div>
  );
}
