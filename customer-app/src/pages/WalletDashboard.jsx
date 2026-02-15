import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { walletService, telemetry } from '../api/client';
import { useNotification } from '../context/NotificationContext';

// Icons (inline SVGs for simplicity)
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReceiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ScanIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round"/>
    <rect x="7" y="7" width="10" height="10" rx="1"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 17l5-5 5 5M7 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 7l-5 5-5-5M17 17l-5-5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getInitials = (name) => {
  if (!name) return null;
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
};

export default function WalletDashboard() {
  const { user } = useAuth();
  const { t, langCode } = useLanguage();
  const { notify, unreadCount, markAsRead } = useNotification();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastTxId, setLastTxId] = useState(null);

  const loadWalletData = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true);
      setError(null);
      
      const wallet = await walletService.getMyWallet();
      const [balanceData, historyData] = await Promise.all([
        walletService.getBalance(wallet.id),
        walletService.getHistory(wallet.id, { limit: 5 })
      ]);
      
      setBalance({
        available: parseFloat(balanceData.available),
        currency: balanceData.currency || 'SSP',
        lastUpdated: new Date()
      });
      
      const mappedTransactions = historyData.data.map(entry => {
        const tx = entry.transaction;
        const isCredit = entry.entryType === 'CREDIT';
        
        // Use enriched info from backend
        const displayTitle = tx.counterpartyName || tx.description || (isCredit ? t('history.received') : t('history.sent'));
        const displaySubtitle = tx.counterpartyPhone ? `${tx.type.replace('_', ' ')} • ${tx.counterpartyPhone}` : tx.type.replace('_', ' ');
        
        return {
          id: entry.id,
          txId: tx.id,
          type: entry.entryType.toLowerCase(),
          title: displayTitle,
          subtitle: displaySubtitle,
          amount: Math.abs(parseFloat(entry.amount)),
          date: new Date(entry.createdAt).toLocaleDateString(langCode === 'ar' ? 'ar-SA' : 'en-US'),
          image: tx.counterpartyImage,
          initials: tx.counterpartyName ? getInitials(tx.counterpartyName) : null,
          isP2P: !!tx.counterpartyPhone
        };
      });

      // Check for new incoming transactions during polling
      if (isPolling && mappedTransactions.length > 0) {
        const latest = mappedTransactions[0];
        if (lastTxId && latest.txId !== lastTxId && latest.type === 'credit') {
          notify(`${t('notifications.receivedMoney') || 'Received Money!'}: SSP ${latest.amount}`, 'received');
        }
      }

      if (mappedTransactions.length > 0) {
        setLastTxId(mappedTransactions[0].txId);
      }

      setTransactions(mappedTransactions);
      if (!isPolling) telemetry.log('dashboard_loaded', { walletId: wallet.id });
    } catch (err) {
      console.error('Dashboard load error:', err);
      if (!isPolling) setError(t('common.error') + ': Failed to load wallet data');
      telemetry.error(err, { context: 'dashboard_load' });
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  }, [langCode, t, lastTxId, notify]);

  useEffect(() => {
    loadWalletData();
    
    // Set up polling for new transactions
    const interval = setInterval(() => {
      loadWalletData(true);
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [loadWalletData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(langCode === 'ar' ? 'ar-SA' : 'en-SS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="page flex-center">
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">{t('common.error')}</h2>
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={loadWalletData}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="flex gap-md" style={{ alignItems: 'center' }}>
          <Link to="/profile" className="avatar-circle" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: 'none' }}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>{getInitials(user?.name) || 'U'}</span>
            )}
          </Link>
          <div>
            <p className="text-caption">{t('wallet.greeting')}</p>
            <p className="text-title">{t('wallet.welcomeBack')} {user?.name?.split(' ')[0] || 'User'}! 👋</p>
          </div>
        </div>
        <Link 
          to="/profile/notifications" 
          className="notification-bell-container"
          onClick={markAsRead}
          style={{ textDecoration: 'none' }}
        >
          <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
          </button>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </header>

      <div className="page-content">
        <div className="balance-card mb-lg">
          <p className="balance-label">{t('wallet.availableBalance')}</p>
          <p className="balance-amount">
            {formatCurrency(balance?.available || 0)}
            <span className="balance-currency">{balance?.currency || 'SSP'}</span>
          </p>
          <p className="text-caption" style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px' }}>
            {t('common.updatedNow')}
          </p>
        </div>

        <div className="quick-actions mb-lg">
          <Link to="/send" className="quick-action" style={{ textDecoration: 'none' }}>
            <SendIcon />
            <span className="quick-action-label">{t('wallet.quickActions.send')}</span>
          </Link>
          <Link to="/receive" className="quick-action" style={{ textDecoration: 'none' }}>
            <ReceiveIcon />
            <span className="quick-action-label">{t('wallet.quickActions.receive')}</span>
          </Link>
          <button className="quick-action">
            <ScanIcon />
            <span className="quick-action-label">{t('wallet.quickActions.scan')}</span>
          </button>
          <Link to="/dev-tools" className="quick-action" style={{ textDecoration: 'none' }}>
            <MoreIcon />
            <span className="quick-action-label">{t('wallet.quickActions.more')}</span>
          </Link>
        </div>

        <div className="flex-between mb-md">
          <h2 className="text-title">{t('wallet.recentTransactions')}</h2>
          <Link to="/history" className="btn btn-ghost" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.875rem' }}>
            {t('wallet.seeAll')}
          </Link>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="transaction-list">
            {transactions.length === 0 ? (
              <div className="empty-state">
                <p>{t('wallet.noTransactions')}</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <Link 
                  key={tx.id} 
                  to={`/history/${tx.id}`}
                  className="transaction-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={`transaction-icon ${tx.type}`} style={{ overflow: 'hidden', position: 'relative', background: 'var(--bg-tertiary)', border: 'none' }}>
                    {tx.image ? (
                      <img src={tx.image} alt={tx.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : tx.initials ? (
                      <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>{tx.initials}</span>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <div className="transaction-details">
                    <p className="transaction-title">{tx.title}</p>
                    <p className="transaction-subtitle">{tx.subtitle} • {tx.date}</p>
                  </div>
                  <p className={`transaction-amount ${tx.type}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
