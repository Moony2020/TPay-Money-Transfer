import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Name, 4: PIN
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (step === 1) {
        if (!phone || phone.length < 9) {
          setError('Please enter a valid phone number');
          setIsLoading(false);
          return;
        }
        setStep(2);
      } else if (step === 2) {
        if (otp.length !== 6) {
          setError('Please enter the 6-digit code');
          setIsLoading(false);
          return;
        }
        setStep(3);
      } else if (step === 3) {
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        setStep(4);
      } else if (step === 4) {
        if (pin.length !== 6) {
          setError('PIN must be 6 digits');
          setIsLoading(false);
          return;
        }
        if (pin !== confirmPin) {
          setError('PINs do not match');
          setIsLoading(false);
          return;
        }
        // Sanitize phone number (strip spaces, dashes, etc.)
        const sanitizedPhone = phone.replace(/\s/g, '');
        const result = await register(sanitizedPhone, name, pin);
        if (result.success) {
          localStorage.setItem('tpay_phone', sanitizedPhone);
          navigate('/login');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
    
    setIsLoading(false);
  };

  const handlePinInput = (digit, isConfirm = false) => {
    if (isConfirm) {
      if (confirmPin.length < 6) setConfirmPin(prev => prev + digit);
    } else {
      if (pin.length < 6) setPin(prev => prev + digit);
    }
  };

  const handleBackspace = (isConfirm = false) => {
    if (isConfirm) setConfirmPin(prev => prev.slice(0, -1));
    else setPin(prev => prev.slice(0, -1));
  };

  const clearPin = (isConfirm = false) => {
    if (isConfirm) setConfirmPin('');
    else setPin('');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="text-heading text-center mb-md">Create Account</h1>
            <p className="text-small text-center mb-lg" style={{ color: 'var(--text-secondary)' }}>
              Enter your phone number to get started
            </p>
            <div className="input-group mb-lg">
              <label className="input-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="input"
                placeholder="+211 9XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h1 className="text-heading text-center mb-md">Verify Phone</h1>
            <p className="text-small text-center mb-lg" style={{ color: 'var(--text-secondary)' }}>
              Enter the 6-digit code sent to {phone}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => {
                    const digit = e.target.value.replace(/\D/g, '').slice(0, 1);
                    const newOtp = otp.split('');
                    newOtp[index] = digit;
                    setOtp(newOtp.join(''));
                    // Auto-advance to next input
                    if (digit && index < 5) {
                      document.getElementById(`otp-${index + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle backspace to go to previous input
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      document.getElementById(`otp-${index - 1}`)?.focus();
                    }
                  }}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#B93B33'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              ))}
            </div>
            <button className="btn btn-ghost mb-md" onClick={() => setStep(1)}>
              Change phone number
            </button>
          </>
        );

      case 3:
        return (
          <>
            <h1 className="text-heading text-center mb-md">Your Name</h1>
            <p className="text-small text-center mb-lg" style={{ color: 'var(--text-secondary)' }}>
              How should we address you?
            </p>
            <div className="input-group mb-lg">
              <label className="input-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h1 className="text-heading text-center mb-md">
              {pin.length < 6 ? 'Set Your PIN' : 'Confirm PIN'}
            </h1>
            <p className="text-small text-center mb-lg" style={{ color: 'var(--text-secondary)' }}>
              {pin.length < 6 ? 'Create a 6-digit PIN' : 'Enter the PIN again to confirm'}
            </p>
            
            <div className="pin-input-container mb-lg">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`pin-dot ${i < (pin.length < 6 ? pin : confirmPin).length ? 'filled' : ''}`}
                />
              ))}
            </div>

            {pin.length === 6 && (
              <button 
                className="btn btn-ghost mb-md" 
                style={{ fontSize: '0.875rem', color: '#B93B33', fontWeight: 600 }}
                onClick={() => {
                  setPin('');
                  setConfirmPin('');
                }}
              >
                ← Back to Set PIN
              </button>
            )}

            <div className="pin-keypad mb-lg">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 0, 'C'].map((key, i) => (
                key === 'back' ? (
                  <button
                    key="backspace"
                    className="pin-key"
                    onClick={() => handleBackspace(pin.length >= 6)}
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
                    onClick={() => clearPin(pin.length >= 6)}
                    aria-label="Clear"
                  >
                    C
                  </button>
                ) : (
                  <button
                    key={`digit-${key}`}
                    className="pin-key"
                    onClick={() => handlePinInput(String(key), pin.length >= 6)}
                  >
                    {key}
                  </button>
                )
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      {/* Fixed Header with Logo */}
      <header className="page-header" style={{ borderBottom: 'none', background: 'transparent' }}>
        <Logo size="sm" />
        <div style={{ width: 40 }} />
      </header>

      <div className="page-content flex-col" style={{ padding: '0 32px 32px' }}>
        {/* Progress Indicator */}
        <div className="flex-center gap-sm mb-xl">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: s <= step ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {renderStep()}

        {/* Error Message */}
        {error && (
          <div className="text-center mb-md" role="alert">
            <p className="input-error-text">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          className="btn btn-primary mb-md"
          onClick={handleNext}
          disabled={isLoading}
          style={{ height: '56px', background: '#B93B33' }}
        >
          {isLoading ? (
            <span className="loading-spinner" style={{ width: 20, height: 20 }} />
          ) : (
            step === 4 && pin.length >= 6 && confirmPin.length === 6 ? 'Create Account' : 'Continue'
          )}
        </button>

        {/* Login Link */}
        <p className="text-center text-small">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
