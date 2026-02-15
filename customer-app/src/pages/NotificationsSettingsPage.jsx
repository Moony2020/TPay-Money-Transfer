import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import BackButton from '../components/BackButton';

export default function NotificationsSettingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { history, markAsRead } = useNotification();
  const [settings, setSettings] = useState({
    transactions: true,
    security: true,
    promo: false,
    updates: true
  });

  useEffect(() => {
    // Clear unread badge when viewing this page
    markAsRead();
  }, [markAsRead]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationClick = (notif) => {
    if (notif.data?.transactionId || notif.data?.txId) {
      navigate(`/history/${notif.data.transactionId || notif.data.txId}`);
    } else if (notif.data?.externalId) {
      navigate(`/history/${notif.data.externalId}`);
    }
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
        {/* Notifications Feed */}
        <h2 className="text-caption mb-sm px-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Activity
        </h2>
        
        <div className="card mb-xl" style={{ padding: 0 }}>
          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 24px' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📭</span>
              <p className="text-body" style={{ opacity: 0.6 }}>No recent notifications</p>
            </div>
          ) : (
            history.map((notif, index) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className="transaction-item"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  background: notif.read ? 'transparent' : 'rgba(185, 59, 51, 0.05)',
                  borderBottom: index < history.length - 1 ? '1px solid var(--border)' : 'none'
                }}
              >
                <div className="transaction-icon" style={{ 
                  background: notif.type === 'received' ? '#34c759' : (notif.type === 'success' ? 'var(--primary)' : 'var(--bg-tertiary)'),
                  color: 'white',
                  borderRadius: '12px'
                }}>
                  {notif.type === 'received' ? '💰' : (notif.type === 'success' ? '✅' : '🔔')}
                </div>
                <div className="transaction-details">
                  <p className="transaction-title" style={{ fontSize: '0.9375rem', fontWeight: notif.read ? 400 : 600 }}>
                    {notif.message}
                  </p>
                  <p className="transaction-subtitle">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                    {new Date(notif.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {!notif.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
              </div>
            ))
          )}
        </div>

        {/* Notification Settings */}
        <h2 className="text-caption mb-sm px-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preferences
        </h2>
        <div className="card" style={{ padding: 0 }}>
          {notificationItems.map((item, index) => (
            <div
              key={item.key}
              className="flex-between w-full"
              style={{
                padding: '16px',
                borderBottom: index < notificationItems.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <span className="text-body" style={{ fontSize: '0.9375rem' }}>{item.label}</span>
              <button
                className={`theme-toggle ${settings[item.key] ? 'active' : ''}`}
                onClick={() => (toggleSetting(item.key))}
                aria-label={`Toggle ${item.label}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
