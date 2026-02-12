import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { walletService } from '../api/client';
import BackButton from '../components/BackButton';

export default function DevTools() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [faucetAmount, setFaucetAmount] = useState(5000);
  const [adminWalletId, setAdminWalletId] = useState('');
  const [adminAmount, setAdminAmount] = useState('');
  const [adminReason, setAdminReason] = useState('Manual adjustment');
  const [adminKey, setAdminKey] = useState('dev-admin-key-123');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFaucet = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await walletService.requestFaucet(faucetAmount);
      setMessage(`Success! New balance: ${result.newBalance} SSP`);
    } catch (err) {
      setError(err.response?.data?.message || 'Faucet failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjust = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await walletService.adminAdjustBalance(
        adminWalletId, 
        parseFloat(adminAmount), 
        adminReason, 
        adminKey
      );
      setMessage(`Adjusted! New balance: ${result.newBalance} SSP`);
    } catch (err) {
      setError(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <BackButton onClick={() => navigate(-1)} />
        <h1 className="page-title">Developer Tools</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="page-content">
        {message && <div className="card mb-md" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' }}>{message}</div>}
        {error && <div className="card mb-md" style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)' }}>{error}</div>}

        <section className="mb-lg">
          <h2 className="text-title mb-md">🚰 Dev Faucet</h2>
          <div className="card">
            <p className="text-caption mb-md">Add test funds to your current wallet (Max 3/day).</p>
            <div className="input-group mb-md">
              <label className="input-label">Amount (SSP)</label>
              <input 
                type="number" 
                className="input" 
                value={faucetAmount} 
                onChange={(e) => setFaucetAmount(e.target.value)} 
              />
            </div>
            <button className="btn btn-primary" onClick={handleFaucet} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Request Funds'}
            </button>
          </div>
        </section>

        <section className="mb-lg">
          <h2 className="text-title mb-md">⚖️ Admin Adjustment</h2>
          <div className="card">
            <p className="text-caption mb-md">Manually set or adjust balance for any wallet.</p>
            <div className="input-group mb-md">
              <label className="input-label">Wallet ID</label>
              <input 
                type="text" 
                className="input" 
                placeholder="UUID" 
                value={adminWalletId} 
                onChange={(e) => setAdminWalletId(e.target.value)} 
              />
            </div>
            <div className="input-group mb-md">
              <label className="input-label">Amount (Positive or Negative)</label>
              <input 
                type="number" 
                className="input" 
                value={adminAmount} 
                onChange={(e) => setAdminAmount(e.target.value)} 
              />
            </div>
            <div className="input-group mb-md">
              <label className="input-label">Reason</label>
              <input 
                type="text" 
                className="input" 
                value={adminReason} 
                onChange={(e) => setAdminReason(e.target.value)} 
              />
            </div>
            <div className="input-group mb-md">
              <label className="input-label">Admin Secret Key</label>
              <input 
                type="password" 
                className="input" 
                value={adminKey} 
                onChange={(e) => setAdminKey(e.target.value)} 
              />
            </div>
            <button className="btn btn-secondary" onClick={handleAdjust} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
