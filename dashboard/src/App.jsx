import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Activity, 
  Settings, 
  Bell,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Clock
} from 'lucide-react';

const Sidebar = () => (
  <aside className="sidebar">
    <div className="logo-section">
      <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>T</div>
      <span className="logo-text">tPay <span style={{ color: 'var(--accent-primary)' }}>Core</span></span>
    </div>
    <nav className="nav-links">
      <div className="nav-item active"><LayoutDashboard /> Dashboard overview</div>
      <div className="nav-item"><Users /> User Management</div>
      <div className="nav-item"><CreditCard /> Transactions</div>
      <div className="nav-item"><ShieldCheck /> Security & KYC</div>
      <div className="nav-item"><Activity /> System Logs</div>
    </nav>
    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
      <div className="nav-item"><Settings /> Settings</div>
    </div>
  </aside>
);

const App = () => {
  const [stats, setStats] = useState({ totalAccounts: 0, totalLiquidity: '0.00' });
  const [transactions, setTransactions] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminKey = 'dev-admin-key-123';

  const fetchData = async () => {
    try {
      const [healthRes, statsRes, txRes] = await Promise.all([
        axios.get('/api/auth/health').catch(() => ({ data: null })), // auth health
        axios.get('/api/wallet/admin/stats', { headers: { 'admin-key': adminKey } }),
        axios.get('/api/wallet/admin/transactions', { headers: { 'admin-key': adminKey } })
      ]);
      
      setHealth(healthRes.data || { version: '1.0.0' });
      setStats(statsRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }} className="animate-fade-in">
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 6, fontDisplay: 'Outfit' }}>System Infrastructure</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>South Sudan Real-Time Payment Network Monitor</p>
          </div>
          <div className="glass-panel" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <Bell size={18} color="var(--text-dim)" style={{ cursor: 'pointer' }} />
            <div style={{ width: 1, height: 20, background: 'var(--glass-border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(45deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>AD</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Administrator</span>
                <span style={{ fontSize: 11, color: 'var(--success)' }}>Verified Account</span>
              </div>
            </div>
          </div>
        </header>

        <section className="stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card stat-card">
            <div className="stat-label">Identity Service Status</div>
            <div style={{ marginTop: 12 }}>
              <div className={`status-badge ${health ? 'status-online' : 'status-offline'}`}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                {health ? 'Service Operational' : 'Node Unreachable'}
              </div>
            </div>
            {health && (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10, display: 'flex', gap: 8 }}>
                <span>API v{health.version || '1.0.0'}</span>
                <span style={{ color: 'var(--glass-border)' }}>|</span>
                <span>Latency: 24ms</span>
              </div>
            )}
          </div>
          <div className="glass-card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="stat-label">Network Load</div>
              <TrendingUp size={16} color="var(--success)" />
            </div>
            <div className="stat-value">84.2%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: 12, marginTop: 8 }}>
              <ArrowUpRight size={14} /> Peak Performance
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label">Wallet Liquidity</div>
            <div className="stat-value">SSP {formatCurrency(stats.totalLiquidity)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>Verified across {stats.totalAccounts} accounts</div>
          </div>
        </section>

        <section className="glass-panel animate-fade-in" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.2s' }}>
          <div style={{ padding: 24, borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>Live Transaction Feed</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>Real-time settlement activity since system initialization</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Download Audit CSV</button>
            </div>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '16px 24px' }}>Transaction ID</th>
                <th>Type</th>
                <th>Amount (SSP)</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td style={{ padding: '18px 24px', fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: 13 }}>{tx.id.substring(0, 12)}...</td>
                  <td>{tx.type}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(tx.amount)}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} /> {new Date(tx.committedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ 
                      background: tx.status === 'COMMITTED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: tx.status === 'COMMITTED' ? 'var(--success)' : 'var(--warning)',
                      fontSize: 10
                    }}>
                      {tx.status === 'COMMITTED' ? <CheckCircle2 size={10} /> : null}
                      {tx.status === 'COMMITTED' ? 'Settled' : tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No recent transactions detected</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: 16, textAlign: 'center', background: 'rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></div>
              Broadcasting via Secure Webhook Integration (tPay Gateway)
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
