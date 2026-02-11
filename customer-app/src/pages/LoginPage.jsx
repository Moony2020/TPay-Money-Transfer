import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
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
    <div className="page" style={{ background: '#FDFDFD' }}>
      {/* Header with Top-Left Logo and Bell icon */}
      <header className="page-header" style={{ borderBottom: 'none', background: 'transparent' }}>
        <Logo size="sm" />
        <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px', color: '#B93B33' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
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
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', fontWeight: 500, color: '#1A1A1A' }}>
                  Enter Your <span style={{ fontWeight: 700 }}>PIN</span>
                </h1>
                <div 
                  onClick={() => setIsChangingPhone(true)}
                  style={{ fontSize: '0.875rem', color: '#B93B33', marginBottom: '32px', cursor: 'pointer', fontWeight: 600 }}
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

                <button className="btn btn-ghost" style={{ fontSize: '0.875rem', color: '#888', fontWeight: 400 }}>
                  Forgot PIN?
                </button>
              </>
            )}
          </div>

          {!isChangingPhone && (
            <>
              <div className="pin-keypad mb-xl">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 0, 'C'].map((key, i) => (
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
                <button className="flex-col flex-center btn-ghost" style={{ border: 'none', background: 'none', cursor: 'pointer', gap: '8px', margin: '0 auto' }}>
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#666" 
                    strokeWidth="1.2" 
                    style={{ width: 56, height: 56 }}
                  >
                    <path d="M11 12c0-1.657 1.343-3 3-3s3 1.343 3 3v2" />
                    <path d="M11 15c0 1.657-1.343 3-3 3s-3-1.343-3-3v-4c0-3.314 2.686-6 6-6s6 2.686 6 6v4" />
                    <path d="M7 15c0 2.209 1.791 4 4 4s4-1.791 4-4v-4c0-4.418 3.582-8 8-8" />
                    <path d="M3 15c0 4.418 3.582 8 8 8s8-3.582 8-8v-4" />
                  </svg>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: '#666' }}>Login with Touch ID</span>
                </button>
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
              background: '#B93B33',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(185, 59, 51, 0.2)'
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
        <p className="text-center text-small" style={{ color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#B93B33', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
