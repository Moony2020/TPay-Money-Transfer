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
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/api');
        setHealth(response.data);
      } catch (err) {
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

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
                <span>API v{health.version}</span>
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
            <div className="stat-value">SSP 42.1M</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>Verified across 1,280 accounts</div>
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
              {[
                { id: 'tx_7a39b201', type: 'Intra-Wallet', amount: '12,500.00', time: '14:22:45', status: 'Settled' },
                { id: 'tx_8e12c192', type: 'Bank Settlement', amount: '850,000.00', time: '14:21:10', status: 'In-Flight' },
                { id: 'tx_9b0021c3', type: 'Merchant QR', amount: '4,200.00', time: '14:18:55', status: 'Settled' },
                { id: 'tx_1c22d344', type: 'P2P Transfer', amount: '2,000.00', time: '14:15:20', status: 'Settled' },
                { id: 'tx_5f33e765', type: 'International', amount: '45,000.00', time: '14:12:00', status: 'Review' },
              ].map((tx, i) => (
                <tr key={i}>
                  <td style={{ padding: '18px 24px', fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: 13 }}>{tx.id}</td>
                  <td>{tx.type}</td>
                  <td style={{ fontWeight: 600, color: tx.amount.includes('850') ? 'var(--accent-primary)' : 'inherit' }}>{tx.amount}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} /> {tx.time}
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ 
                      background: tx.status === 'Settled' ? 'rgba(16, 185, 129, 0.1)' : tx.status === 'Review' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: tx.status === 'Settled' ? 'var(--success)' : tx.status === 'Review' ? 'var(--danger)' : 'var(--warning)',
                      fontSize: 10
                    }}>
                      {tx.status === 'Settled' ? <CheckCircle2 size={10} /> : null}
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
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
