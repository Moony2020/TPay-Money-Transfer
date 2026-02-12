import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

export default function ReceiveMoney() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const walletIdentifier = user?.phoneNumber || user?.email || 'TP-00000000';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletIdentifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=tpay:${walletIdentifier}&color=1A1A1A&margin=10`;

  return (
    <div className="page" style={{ paddingBottom: '32px' }}>
      <header className="page-header">
        <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px' }} onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <h1 className="text-title" style={{ flex: 1, textAlign: 'center', marginRight: '40px' }}>
          {t('receive.title')}
        </h1>
      </header>

      <div className="page-content flex-col items-center" style={{ marginTop: '24px' }}>
        <div className="card w-full flex-col items-center" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p className="text-caption mb-lg" style={{ maxWidth: '280px', margin: '0 auto 24px' }}>
            {t('receive.instruction')}
          </p>
          
          <div className="qr-container mb-xl" style={{ 
            background: '#FFFFFF', 
            padding: '16px', 
            borderRadius: '24px', 
            boxShadow: '0 20px 48px rgba(0,0,0,0.08)',
            border: '1px solid #F0F0F0',
            width: '252px',
            height: '252px',
            margin: '0 auto 32px'
          }}>
            <img 
              src={qrUrl} 
              alt="Receive QR Code" 
              style={{ width: '220px', height: '220px', display: 'block' }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p className="text-title mb-xs">{user?.name || 'User'}</p>
            <div 
              className="flex-center gap-sm" 
              onClick={handleCopy} 
              style={{ 
                cursor: 'pointer', 
                background: 'rgba(0,0,0,0.03)', 
                padding: '8px 16px', 
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <p className="text-caption" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                {walletIdentifier}
              </p>
              <CopyIcon />
            </div>
            {copied && (
              <p className="text-caption mt-xs" style={{ color: '#E15E4B', fontWeight: 700 }}>
                {t('receive.copied')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-xl w-full" style={{ marginTop: '32px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'TPay - Receive Money',
                  text: `Send money to my TPay wallet: ${walletIdentifier}`,
                  url: window.location.origin
                });
              } else {
                handleCopy();
              }
            }}
            style={{ 
              height: '64px', 
              borderRadius: '32px',
              fontSize: '1.1rem',
              fontWeight: 700
            }}
          >
            {t('receive.share')}
          </button>
        </div>
      </div>
    </div>
  );
}
