import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletService, telemetry } from '../api/client';
import BackButton from '../components/BackButton';

export default function SendMoney() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Recipient, 2: Amount, 3: Confirm, 4: Success
  const [senderWallet, setSenderWallet] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionResult, setTransactionResult] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const wallet = await walletService.getMyWallet();
        setSenderWallet(wallet);
      } catch (err) {
        console.error('Failed to fetch wallet:', err);
        setError('Could not load your wallet. Please try again.');
      }
    };
    fetchWallet();
  }, []);

  const quickAmounts = [500, 1000, 5000, 10000];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-SS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      if (!recipient || recipient.length < 9) {
        setError('Please enter a valid phone number');
        return;
      }
      // Clean phone number
      const cleanPhone = recipient.replace(/[\s-]/g, '');
      if (!cleanPhone.startsWith('+211')) {
        setError('Phone number must start with +211');
        return;
      }

      setRecipientName('Recipient'); // Default/Mock for now since we don't have lookup API yet
      setStep(2);
    } else if (step === 2) {
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      await executeTransfer();
    }
  };

  const executeTransfer = async () => {
    if (!senderWallet) {
      setError('Sender wallet not loaded');
      return;
    }

    setIsLoading(true);
    try {
      const result = await walletService.sendMoney(
        senderWallet.id,
        recipient.replace(/[\s-]/g, ''),
        amount,
        description || 'P2P Transfer'
      );
      
      setTransactionResult({
        id: result.id,
        status: result.status,
        amount: parseFloat(amount),
        recipient: recipientName,
        timestamp: new Date().toISOString()
      });
      
      setStep(4);
      telemetry.log('transfer_success', { amount: parseFloat(amount), txId: result.id });
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.message || 'Transfer failed. Check your balance.');
      telemetry.error(err, { context: 'transfer' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <header className="page-header">
              <BackButton onClick={() => navigate(-1)} />
              <h1 className="page-title">Send Money</h1>
              <div style={{ width: 40 }} />
            </header>
            <div className="page-content">
              <h2 className="text-heading mb-md">Who are you sending to?</h2>
              
              <div className="input-group mb-lg">
                <label className="input-label" htmlFor="recipient">Phone Number</label>
                <input
                  id="recipient"
                  type="tel"
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="+211 9XX XXX XXX"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                {error && <span className="input-error-text">{error}</span>}
              </div>

              {/* Quick Contacts (Mock) */}
              <p className="text-small mb-sm" style={{ color: 'var(--text-secondary)' }}>Recent</p>
              <div className="flex gap-md mb-lg" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                {['Jane D.', 'Mike S.', 'Sarah K.'].map((name, i) => (
                  <button 
                    key={i}
                    className="flex-col flex-center gap-xs"
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      minWidth: '64px'
                    }}
                    onClick={() => {
                      setRecipient('+211 9' + String(i + 1).repeat(8));
                      setRecipientName(name);
                    }}
                  >
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      {name[0]}
                    </div>
                    <span className="text-caption">{name}</span>
                  </button>
                ))}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!recipient}
              >
                Continue
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <header className="page-header">
              <BackButton onClick={() => setStep(1)} />
              <h1 className="page-title">Enter Amount</h1>
              <div style={{ width: 40 }} />
            </header>
            <div className="page-content">
              {/* Recipient Card */}
              <div className="card mb-lg flex gap-md" style={{ alignItems: 'center' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 600
                }}>
                  {recipientName[0]}
                </div>
                <div>
                  <p className="text-title">{recipientName}</p>
                  <p className="text-caption">{recipient}</p>
                </div>
              </div>

              {/* Amount Input */}
              <div className="text-center mb-lg">
                <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SSP </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      fontFamily: 'inherit',
                      width: '150px',
                      textAlign: 'left',
                      outline: 'none'
                    }}
                    aria-label="Amount"
                  />
                </div>
                {error && <p className="input-error-text mt-md">{error}</p>}
              </div>

              {/* Quick Amounts */}
              <div className="flex gap-sm mb-lg" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                {quickAmounts.map((qa) => (
                  <button
                    key={qa}
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '0.875rem' }}
                    onClick={() => setAmount(String(qa))}
                  >
                    +{formatCurrency(qa)}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="input-group mb-lg">
                <label className="input-label" htmlFor="description">Note (optional)</label>
                <input
                  id="description"
                  type="text"
                  className="input"
                  placeholder="What's this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Review Transfer
              </button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <header className="page-header">
              <BackButton onClick={() => setStep(2)} />
              <h1 className="page-title">Confirm Transfer</h1>
              <div style={{ width: 40 }} />
            </header>
            <div className="page-content">
              {/* Summary Card */}
              <div className="card mb-lg text-center" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-caption mb-sm">You are sending</p>
                <p className="text-display" style={{ color: 'var(--primary)' }}>
                  SSP {formatCurrency(parseFloat(amount))}
                </p>
                <p className="text-caption mt-sm">to {recipientName}</p>
              </div>

              {/* Details */}
              <div className="card mb-lg">
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>To</span>
                  <span className="text-small">{recipientName}</span>
                </div>
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>Phone</span>
                  <span className="text-small">{recipient}</span>
                </div>
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>Amount</span>
                  <span className="text-small">SSP {formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>Fee</span>
                  <span className="text-small" style={{ color: 'var(--success)' }}>Free</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                <div className="flex-between">
                  <span className="text-title">Total</span>
                  <span className="text-title">SSP {formatCurrency(parseFloat(amount))}</span>
                </div>
              </div>

              {error && (
                <div className="text-center mb-md">
                  <p className="input-error-text">{error}</p>
                </div>
              )}

              <button
                className="btn btn-primary mb-md"
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner" style={{ width: 20, height: 20 }} />
                ) : (
                  'Confirm & Send'
                )}
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => navigate('/home')}
              >
                Cancel
              </button>
            </div>
          </>
        );

      case 4:
        return (
          <div className="page flex-center" style={{ background: 'var(--bg-primary)' }}>
            <div className="text-center p-lg">
              {/* Success Animation */}
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'var(--success)',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2.5rem', color: 'white' }}>✓</span>
              </div>

              <h1 className="text-heading mb-sm">Transfer Successful!</h1>
              <p className="text-body mb-lg" style={{ color: 'var(--text-secondary)' }}>
                SSP {formatCurrency(parseFloat(amount))} sent to {recipientName}
              </p>

              {/* Receipt ID */}
              <div className="card mb-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-caption">Transaction ID</p>
                <p className="text-small" style={{ fontFamily: 'var(--font-mono)' }}>
                  {transactionResult?.id}
                </p>
              </div>

              <button
                className="btn btn-primary mb-md"
                onClick={() => navigate('/home')}
              >
                Done
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  // In real app: share receipt
                  telemetry.log('receipt_shared');
                }}
              >
                Share Receipt
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="page">{renderStep()}</div>;
}
