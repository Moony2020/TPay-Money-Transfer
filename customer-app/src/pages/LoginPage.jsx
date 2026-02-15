import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { telemetry } from '../api/client';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { unreadCount, markAsRead } = useNotification();
  
  // Get and sanitize phone from localStorage
  const rawPhone = localStorage.getItem('tpay_phone') || '+211912345678';
  const phone = rawPhone.replace(/\s/g, '');
  
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);

  const normalizedPhone = tempPhone.replace(/[\s-]/g, '');
  const canContinueWithPhone = normalizedPhone.length >= 9;

  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const clearPin = () => {
    setPin('');
  };

  const handleSubmit = async () => {
    if (isChangingPhone) {
      if (!canContinueWithPhone) {
        setError('Please enter a valid phone number');
        return;
      }
      localStorage.setItem('tpay_phone', normalizedPhone);
      setError('');
      setIsChangingPhone(false);
      return;
    }

    if (pin.length !== 6) {
      setError('Please enter your 6-digit PIN');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const result = await login(phone, pin);
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
      setPin('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="page" style={{ background: 'var(--bg-primary)', paddingBottom: '12px' }}>
      {/* Header with Top-Left Logo and Bell icon - Non-sticky */}
      <header className="page-header" style={{ borderBottom: 'none', background: 'transparent', position: 'relative' }}>
        <Logo size="sm" />
        <Link 
          to="/profile/notifications" 
          className="notification-bell-container"
          onClick={markAsRead}
          style={{ textDecoration: 'none' }}
        >
          <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px', color: '#B93B33' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </header>

      <div className="page-content flex-col" style={{ padding: '0 32px 32px', flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* PIN Section Header */}
          <div className="text-center mb-xl">
            {isChangingPhone ? (
              <>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', fontWeight: 500, color: '#1A1A1A' }}>
                  Switch <span style={{ fontWeight: 700 }}>Account</span>
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '24px' }}>
                  Enter your phone number
                </p>
                <div className="input-group mb-lg">
                  <input
                    type="tel"
                    className="input"
                    placeholder="+211 9XX XXX XXX"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    autoFocus
                  />
                </div>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Enter Your <span style={{ fontWeight: 700 }}>PIN</span>
                </h1>
                <div 
                  onClick={() => setIsChangingPhone(true)}
                  style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '32px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {phone} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Change)</span>
                </div>
                
                {/* 6-Pin Dots */}
                <div className="pin-input-container mb-lg">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`pin-dot ${i < pin.length ? 'filled' : ''}`}
                    />
                  ))}
                </div>

                <button 
                  className="btn-link" 
                  style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)', 
                    fontWeight: 400,
                    width: 'fit-content',
                    margin: '-6px auto 12px',
                    padding: '10px 24px',
                    border: 'none',
                    background: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'block',
                    transition: 'all 0.2s ease',
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.opacity = '0.8';
                  }}
                >
                  Forgot PIN?
                </button>
              </>
            )}
          </div>

          {!isChangingPhone && (
            <>
              <div className="pin-keypad mb-xl">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 0, 'C'].map((key) => (
                  key === 'back' ? (
                    <button
                      key="backspace"
                      className="pin-key"
                      onClick={() => setPin(prev => prev.slice(0, -1))}
                      aria-label="Backspace"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                        <line x1="18" y1="9" x2="12" y2="15" />
                        <line x1="12" y1="9" x2="18" y2="15" />
                      </svg>
                    </button>
                  ) :
                  key === 'C' ? (
                    <button
                      key="clear"
                      className="pin-key"
                      onClick={clearPin}
                      aria-label="Clear PIN"
                    >
                      C
                    </button>
                  ) : (
                    <button
                      key={`digit-${key}`}
                      className="pin-key"
                      onClick={() => handlePinInput(String(key))}
                      aria-label={String(key)}
                    >
                      {key}
                    </button>
                  )
                ))}
              </div>

              {/* Fingerprint Login */}
              <div className="text-center mb-lg">
                <div 
                  className="flex-col flex-center" 
                  style={{ cursor: 'pointer', margin: '0 auto', width: 'fit-content', marginTop: '12px' }}
                  onClick={() => telemetry.log('biometric_clicked')}
                >
                  <button 
                    className="flex-col flex-center btn-ghost" 
                    style={{ 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer', 
                      padding: '8px 20px 8px 20px',
                      borderRadius: '16px',
                      transition: 'all 0.2s ease',
                      marginBottom: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                    aria-label="Login with Biometrics"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="var(--text-muted)" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      style={{ width: 44, height: 44 }}
                    >
                      {/* Concentric Arcs - Symmetrical and Elongated */}
                      <path d="M11 13v-1a1 1 0 0 1 2 0v2" />
                      <path d="M8 15v-3a4 4 0 0 1 8 0v3" />
                      <path d="M5 16v-4a7 7 0 0 1 14 0v4" />
                      <path d="M2 17v-5a10 10 0 0 1 20 0v5" />
                    </svg>
                  </button>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)', opacity: 0.9 }}>
                    Login with Touch ID
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-md" role="alert">
            <p className="input-error-text">{error}</p>
          </div>
        )}

        {/* Login Button */}
        <div style={{ padding: '0 4px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || (isChangingPhone ? !canContinueWithPhone : pin.length !== 6)}
            style={{ 
              height: '56px', 
              fontSize: '1.125rem', 
              background: 'var(--primary)',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {isLoading ? (
              <span className="loading-spinner" style={{ width: 24, height: 24 }} />
            ) : (
              isChangingPhone ? 'Continue' : 'Login'
            )}
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-small" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
