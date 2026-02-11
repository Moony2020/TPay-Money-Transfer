import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { walletService, telemetry } from '../api/client';

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

export default function WalletDashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch user's wallet
      const wallet = await walletService.getMyWallet();
      
      // Fetch balance and history in parallel
      const [balanceData, historyData] = await Promise.all([
        walletService.getBalance(wallet.id),
        walletService.getHistory(wallet.id, { limit: 5 })
      ]);
      
      setBalance({
        available: parseFloat(balanceData.available),
        currency: balanceData.currency || 'SSP',
        lastUpdated: new Date()
      });
      
      // Map API response to UI model
      const mappedTransactions = historyData.data.map(entry => ({
        id: entry.id,
        type: entry.entryType.toLowerCase(), // 'credit' or 'debit'
        title: entry.transaction.description || (entry.entryType === 'CREDIT' ? 'Received' : 'Sent'),
        subtitle: entry.transaction.type.replace('_', ' '),
        amount: Math.abs(parseFloat(entry.amount)),
        date: new Date(entry.createdAt).toLocaleDateString()
      }));

      setTransactions(mappedTransactions);
      
      telemetry.log('dashboard_loaded', { walletId: wallet.id });
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load wallet data. Please try again.');
      telemetry.error(err, { context: 'dashboard_load' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
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
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={loadWalletData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="page-header">
        <div>
          <p className="text-caption">Good morning,</p>
          <p className="text-title">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</p>
        </div>
        <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px' }}>
          🔔
        </button>
      </header>

      <div className="page-content">
        {/* Balance Card */}
        <div className="balance-card mb-lg">
          <p className="balance-label">Available Balance</p>
          <p className="balance-amount">
            {formatCurrency(balance?.available || 0)}
            <span className="balance-currency">{balance?.currency || 'SSP'}</span>
          </p>
          <p className="text-caption" style={{ opacity: 0.7, marginTop: '8px' }}>
            Updated just now
          </p>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions mb-lg">
          <Link to="/send" className="quick-action" style={{ textDecoration: 'none' }}>
            <SendIcon />
            <span className="quick-action-label">Send</span>
          </Link>
          <button className="quick-action">
            <ReceiveIcon />
            <span className="quick-action-label">Receive</span>
          </button>
          <button className="quick-action">
            <ScanIcon />
            <span className="quick-action-label">Scan QR</span>
          </button>
          <button className="quick-action">
            <MoreIcon />
            <span className="quick-action-label">More</span>
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="flex-between mb-md">
          <h2 className="text-title">Recent Transactions</h2>
          <Link to="/history" className="btn btn-ghost" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.875rem' }}>
            See All
          </Link>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="transaction-list">
            {transactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <Link 
                  key={tx.id} 
                  to={`/history/${tx.id}`}
                  className="transaction-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={`transaction-icon ${tx.type}`}>
                    {tx.type === 'credit' ? <ArrowDownIcon /> : <ArrowUpIcon />}
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
