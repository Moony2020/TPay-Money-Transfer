import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { walletService, telemetry } from '../api/client';
import BackButton from '../components/BackButton';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, sent, received
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const wallet = await walletService.getMyWallet();
      const history = await walletService.getHistory(wallet.id, { limit: 50 });
      
      const mapped = history.data.map(entry => ({
        id: entry.id,
        type: entry.entryType.toLowerCase(),
        title: entry.transaction.description || (entry.entryType === 'CREDIT' ? 'Received' : 'Sent'),
        subtitle: entry.transaction.type.replace('_', ' '),
        amount: Math.abs(parseFloat(entry.amount)),
        date: entry.createdAt,
        status: entry.transaction.status
      }));

      let filtered = mapped;
      if (filter === 'sent') {
        filtered = mapped.filter(tx => tx.type === 'debit');
      } else if (filter === 'received') {
        filtered = mapped.filter(tx => tx.type === 'credit');
      }

      setTransactions(filtered);
      telemetry.log('history_loaded', { filter, count: filtered.length });
    } catch (err) {
      console.error('History load error:', err);
      setError('Failed to load transaction history');
      telemetry.error(err, { context: 'history_load' });
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

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

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Amount', 'Status'];
    const rows = transactions.map(tx => [
      new Date(tx.date).toISOString(),
      tx.title,
      tx.type,
      tx.amount,
      tx.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tpay_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    telemetry.log('export_csv');
  };

  return (
    <div className="page">
      <header className="page-header">
        <BackButton />
        <h1 className="page-title">Transactions</h1>
        <button 
          className="btn btn-ghost"
          onClick={exportToCSV}
          style={{ width: 'auto', padding: '8px', fontSize: '0.875rem' }}
          aria-label="Export transactions"
        >
          ⬇️
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-sm p-md" style={{ borderBottom: '1px solid var(--border)' }}>
        {[
          { value: 'all', label: 'All' },
          { value: 'received', label: 'Received' },
          { value: 'sent', label: 'Sent' }
        ].map(({ value, label }) => (
          <button
            key={value}
            className={`btn ${filter === value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(value)}
            style={{ flex: 1, padding: '10px 8px', fontSize: '0.875rem' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="page-content" style={{ paddingTop: 0 }}>
        {isLoading ? (
          <div className="flex-center" style={{ padding: '48px' }}>
            <div className="loading-spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button className="btn btn-primary" onClick={loadTransactions}>
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map((tx) => (
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
                  <p className="transaction-subtitle">{tx.subtitle} • {formatDate(tx.date)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className={`transaction-amount ${tx.type}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-caption" style={{ color: 'var(--success)', fontSize: '0.625rem' }}>
                    {tx.status === 'COMMITTED' ? '✓ Complete' : tx.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
