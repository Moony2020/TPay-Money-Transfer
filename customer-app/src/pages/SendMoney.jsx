import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { walletService, telemetry } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import BackButton from '../components/BackButton';

export default function SendMoney() {
  const navigate = useNavigate();
  const { t, langCode } = useLanguage();
  const { notify } = useNotification();
  const [step, setStep] = useState(1); // 1: Recipient, 2: Amount, 3: Confirm, 4: Success
  const [senderWallet, setSenderWallet] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [transactionResult, setTransactionResult] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const wallet = await walletService.getMyWallet();
        setSenderWallet(wallet);
        
        // Also fetch balance immediately
        const balanceData = await walletService.getBalance(wallet.id);
        setBalance(parseFloat(balanceData.available));
      } catch (err) {
        console.error('Failed to fetch wallet:', err);
        setError(t('common.error') + ': Could not load wallet');
      }
    };
    fetchWallet();
  }, [t]);

  // Real-time recipient lookup
  useEffect(() => {
    const lookupRecipient = async () => {
      let digits = recipient.replace(/[^\d+]/g, '');
      if (!digits) {
        setRecipientName('');
        return;
      }
      
      if (!digits.startsWith('+')) {
        if (digits.startsWith('211')) digits = '+' + digits;
        else if (digits.startsWith('0')) digits = '+211' + digits.substring(1);
        else digits = '+211' + digits;
      }

      if (digits.length >= 10) {
        try {
          const data = await walletService.lookupPhone(digits);
          if (data && data.fullName) {
            setRecipientName(data.fullName);
          } else {
            const label = t('send.recipient');
            setRecipientName(label && label !== 'send.recipient' ? label : 'Recipient');
          }
        } catch (err) {
          console.error('Lookup failed:', err);
          const label = t('send.recipient');
          setRecipientName(label && label !== 'send.recipient' ? label : 'Recipient');
        }
      } else {
        setRecipientName('');
      }
    };

    const timeout = setTimeout(lookupRecipient, 500);
    return () => clearTimeout(timeout);
  }, [recipient, t]);

  const quickAmounts = [500, 1000, 5000, 10000];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(langCode === 'ar' ? 'ar-SA' : 'en-SS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      setError('');
      console.log('>>> [SendMoney] handleNext Step 1 hit, recipient:', recipient);
      
      let digits = recipient.replace(/[^\d+]/g, '');
      if (!digits) {
        setError('Please enter a phone number');
        return;
      }
      
      if (!digits.startsWith('+')) {
        if (digits.startsWith('211')) digits = '+' + digits;
        else if (digits.startsWith('0')) digits = '+211' + digits.substring(1);
        else digits = '+211' + digits;
      }

      if (digits.length < 10) {
        setError('Phone number is too short');
        return;
      }

      setRecipient(digits);
      // Recipient name is already set by lookup effect
      setStep(2);
    } else if (step === 2) {
      const numAmount = parseFloat(amount);
      if (!amount || numAmount <= 0) {
        setError(t('send.enterValidAmount') || 'Please enter a valid amount');
        return;
      }

      // Final balance check before moving to confirm
      setIsLoading(true);
      try {
        const balanceData = await walletService.getBalance(senderWallet.id);
        const currentBalance = parseFloat(balanceData.available);
        setBalance(currentBalance);

        if (numAmount > currentBalance) {
          setError(`${t('send.insufficientFunds')}. ${t('send.available')}: ${formatCurrency(currentBalance)}`);
          setIsLoading(false);
          return;
        }
        setStep(3);
      } catch {
        setError(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    } else if (step === 3) {
      await executeTransfer();
    }
  };

  const handleShare = async () => {
    if (!transactionResult) return;
    
    const shareText = `tPay Transfer Successful!\n\nSent SSP ${formatCurrency(transactionResult.amount)} to ${transactionResult.recipient}.\n\nTransaction ID: ${transactionResult.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'tPay Transfer Receipt',
          text: shareText,
          url: window.location.origin
        });
        telemetry.log('receipt_shared', { method: 'web_share' });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        notify('Receipt copied to clipboard!', 'success');
        telemetry.log('receipt_shared', { method: 'clipboard' });
      } catch (err) {
        console.error('Clipboard failed:', err);
        notify('Failed to copy receipt', 'error');
      }
    }
  };

  const executeTransfer = async () => {
    if (!senderWallet) {
      setError('Sender wallet not loaded');
      return;
    }

    setIsLoading(true);
    try {
      console.log('>>> [SendMoney] Executing transfer...');
      const result = await walletService.sendMoney(
        senderWallet.id,
        recipient.replace(/[\s-]/g, ''),
        amount,
        description || 'P2P Transfer'
      );
      
      console.log('>>> [SendMoney] Transfer result:', result);

      setTransactionResult({
        id: result.transaction?.id || result.id || 'N/A',
        status: result.transaction?.status || result.status,
        amount: parseFloat(amount),
        recipient: recipientName,
        timestamp: new Date().toISOString()
      });
      
      setStep(4);
      telemetry.log('transfer_success', { amount: parseFloat(amount), txId: result.transaction?.id || result.id });
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.message || t('common.error'));
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
              <h1 className="page-title">{t('send.title')}</h1>
              <div style={{ width: 40 }} />
            </header>
            <div className="page-content">
              <h2 className="text-heading mb-md">{t('send.who')}</h2>
              
              <div className="input-group mb-lg">
                <label className="input-label" htmlFor="recipient">{t('send.phone')}</label>
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

              <p className="text-small mb-sm" style={{ color: 'var(--text-secondary)' }}>{t('send.recent')}</p>
              <div className="flex gap-md mb-lg" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                {['Jane D.', 'Mike S.', 'Sarah K.'].map((name, i) => (
                  <button 
                    key={i}
                    className="flex-col flex-center gap-xs"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', minWidth: '64px' }}
                    onClick={() => {
                      setRecipient('+211 9' + String(i + 1).repeat(8));
                      setRecipientName(name);
                    }}
                  >
                    <div className="avatar-circle" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      {name[0]}
                    </div>
                    <span className="text-caption">{name}</span>
                  </button>
                ))}
              </div>

              <button className="btn btn-primary" onClick={handleNext} disabled={!recipient}>
                {t('common.continue')}
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <header className="page-header">
              <BackButton onClick={() => setStep(1)} />
              <h1 className="page-title">{t('send.enterAmount')}</h1>
              <div style={{ width: 40 }} />
            </header>
            <div className="page-content">
              <div className="card mb-lg flex gap-md" style={{ alignItems: 'center' }}>
                <div className="avatar-circle" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                  {recipientName[0]}
                </div>
                <div>
                  <p className="text-title">{recipientName}</p>
                  <p className="text-caption">{recipient}</p>
                </div>
              </div>

              <div className="text-center mb-lg">
                <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SSP </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ border: 'none', background: 'transparent', fontSize: 'inherit', fontWeight: 'inherit', fontFamily: 'inherit', width: '150px', textAlign: 'left', outline: 'none', color: 'inherit' }}
                    aria-label="Amount"
                  />
                </div>
                <p className="text-caption mt-sm" style={{ color: parseFloat(amount) > balance ? 'var(--error)' : 'var(--text-secondary)' }}>
                  {t('send.available')}: SSP {formatCurrency(balance)}
                </p>
                {error && <p className="input-error-text mt-md">{error}</p>}
              </div>

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

              <div className="input-group mb-lg">
                <label className="input-label" htmlFor="description">{t('send.note')}</label>
                <input
                  id="description"
                  type="text"
                  className="input"
                  placeholder={t('send.notePlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleNext} 
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || isLoading}
              >
                {isLoading ? <span className="loading-spinner" style={{ width: 20, height: 20 }} /> : t('send.review')}
              </button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <header className="page-header">
              <BackButton onClick={() => setStep(2)} />
              <h1 className="page-title">{t('send.confirm')}</h1>
              <div style={{ width: 40 }} />
            </header>
            <div className="page-content">
              <div className="card mb-lg text-center" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-caption mb-sm">{t('send.sending')}</p>
                <p className="text-display" style={{ color: 'var(--primary)' }}>
                  SSP {formatCurrency(parseFloat(amount))}
                </p>
                <p className="text-caption mt-sm">{t('send.to')} {recipientName}</p>
              </div>

              <div className="card mb-lg">
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>{t('send.details.to')}</span>
                  <span className="text-small">{recipientName}</span>
                </div>
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>{t('send.details.phone')}</span>
                  <span className="text-small">{recipient}</span>
                </div>
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>{t('send.details.amount')}</span>
                  <span className="text-small">SSP {formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex-between mb-md">
                  <span className="text-small" style={{ color: 'var(--text-secondary)' }}>{t('send.details.fee')}</span>
                  <span className="text-small" style={{ color: 'var(--success)' }}>{t('send.details.free')}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                <div className="flex-between">
                  <span className="text-title">{t('send.details.total')}</span>
                  <span className="text-title">SSP {formatCurrency(parseFloat(amount))}</span>
                </div>
              </div>

              {error && <div className="text-center mb-md"><p className="input-error-text">{error}</p></div>}

              <button className="btn btn-primary mb-md" onClick={handleNext} disabled={isLoading}>
                {isLoading ? <span className="loading-spinner" style={{ width: 20, height: 20 }} /> : t('send.confirmAndSend')}
              </button>

              <button className="btn btn-ghost" onClick={() => navigate('/home')}>
                {t('common.cancel')}
              </button>
            </div>
          </>
        );

      case 4:
        return (
          <div className="page flex-center" style={{ background: 'var(--bg-primary)' }}>
            <div className="text-center p-lg">
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.5rem', color: 'white', lineHeight: 1 }}>✓</span>
              </div>
              <h1 className="text-heading mb-sm">{t('send.success')}</h1>
              <p className="text-body mb-lg" style={{ color: 'var(--text-secondary)' }}>
                SSP {formatCurrency(parseFloat(amount))} {t('send.to')} {recipientName}
              </p>
              <div className="card mb-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-caption">{t('send.transactionId')}</p>
                <p className="text-small" style={{ fontFamily: 'var(--font-mono)' }}>{transactionResult?.id}</p>
              </div>
              <button className="btn btn-primary mb-md" onClick={() => navigate('/home')}>{t('common.done')}</button>
              <button className="btn btn-secondary mb-md" onClick={handleShare}>{t('send.share')}</button>
              {error && <p className="text-success text-small animate-fade-in">{error}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="page">{renderStep()}</div>;
}
