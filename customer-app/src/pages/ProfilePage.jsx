import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function getUserInitial(user) {
  const fullName = user?.name?.trim();
  if (fullName) {
    return fullName[0].toUpperCase();
  }
  const phone = user?.phone?.trim();
  if (phone) {
    return phone[0].toUpperCase();
  }
  return 'U';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, logout, uploadProfileImage, removeProfileImage } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageSuccessMessage, setImageSuccessMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectImageClick = () => {
    setImageError('');
    setImageSuccessMessage('');
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, WEBP, and GIF images are supported.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError('Image must be 2 MB or smaller.');
      return;
    }

    setIsUploadingImage(true);
    setImageError('');
    setImageSuccessMessage('');

    try {
      const imageData = await fileToDataUrl(file);
      const result = await uploadProfileImage(imageData);

      if (!result.success) {
        setImageError(result.error);
        return;
      }

      setImageSuccessMessage('Profile photo updated.');
    } catch (error) {
      setImageError(error.message || 'Unable to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsRemovingImage(true);
    setImageError('');
    setImageSuccessMessage('');

    try {
      const result = await removeProfileImage();
      if (!result.success) {
        setImageError(result.error);
        return;
      }
      setImageSuccessMessage('Profile photo removed.');
    } catch (error) {
      setImageError(error.message || 'Unable to remove image');
    } finally {
      setIsRemovingImage(false);
    }
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: '\u{1F464}',
          iconTone: 'plum',
          label: 'Personal Information',
          action: () => {},
        },
        {
          icon: '\u{1F512}',
          iconTone: 'amber',
          label: 'Security & PIN',
          action: () => {},
        },
        {
          icon: '\u{1F4CB}',
          iconTone: 'mint',
          label: 'KYC Status',
          badge: 'Verified',
          badgeColor: 'var(--success)',
          action: () => {},
        },
      ],
    },
    {
      title: 'Linked Accounts',
      items: [
        {
          icon: '\u{1F3E6}',
          iconTone: 'indigo',
          label: 'Bank Accounts',
          badge: 'Coming Soon',
          badgeColor: 'var(--text-muted)',
          action: () => {},
        },
        {
          icon: '\u{1F4F1}',
          iconTone: 'sky',
          label: 'Mobile Money',
          badge: 'Coming Soon',
          badgeColor: 'var(--text-muted)',
          action: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: '\u{1F514}',
          iconTone: 'amber',
          label: 'Notifications',
          action: () => {},
        },
        {
          icon: '\u{1F319}',
          iconTone: 'slate',
          label: 'Dark Mode',
          badge: 'Phase 2',
          badgeColor: 'var(--text-muted)',
          action: () => {},
        },
        {
          icon: '\u{1F310}',
          iconTone: 'teal',
          label: 'Language',
          badge: 'English',
          action: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: '\u{1F198}',
          iconTone: 'sky',
          label: 'Help Center',
          action: () => {},
        },
        {
          icon: '\u{1F4AC}',
          iconTone: 'rose',
          label: 'Contact Support',
          action: () => {},
        },
        {
          icon: '\u{1F4C4}',
          iconTone: 'sage',
          label: 'Terms & Privacy',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <BackButton />
        <h1 className="page-title">Profile</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="page-content">
        <div className="card mb-lg" style={{ textAlign: 'center' }}>
          <div className="profile-avatar">
            <div className="profile-avatar-image">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '2rem', fontWeight: 600 }}>
                  {getUserInitial(user)}
                </span>
              )}
            </div>
            <button
              type="button"
              className="profile-avatar-action"
              onClick={handleSelectImageClick}
              disabled={isUploadingImage}
              aria-label={isUploadingImage ? 'Uploading photo...' : 'Change profile photo'}
            />
          </div>

          <p className="text-title">{user?.name || 'User'}</p>
          <p className="text-caption mb-sm">{user?.phone || '+211 9XX XXX XXX'}</p>

          {user?.profileImage && (
            <button
              onClick={handleRemoveImage}
              disabled={isRemovingImage}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: 'var(--danger, #dc2626)',
                fontWeight: 500,
                padding: '2px 0',
                margin: '4px auto 8px',
                cursor: 'pointer',
                display: 'block',
              }}
            >
              {isRemovingImage ? 'Removing...' : 'Remove Photo'}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {imageError && (
            <p className="input-error-text mt-sm" role="alert">
              {imageError}
            </p>
          )}

          {imageSuccessMessage && (
            <p className="text-small mt-sm" style={{ color: 'var(--success)' }}>
              {imageSuccessMessage}
            </p>
          )}

          <div className="flex-center gap-xs mt-sm">
            <span
              style={{
                background: 'rgba(5, 150, 105, 0.1)',
                color: 'var(--success)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              Verified
            </span>
          </div>
        </div>

        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-lg">
            <p className="text-caption mb-sm" style={{ paddingLeft: '4px' }}>
              {section.title}
            </p>
            <div className="card" style={{ padding: 0 }}>
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  className="flex-between w-full"
                  onClick={item.action}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '16px',
                    borderBottom:
                      itemIndex < section.items.length - 1
                        ? '1px solid var(--border)'
                        : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span className="flex gap-md" style={{ alignItems: 'center' }}>
                    <span
                      className={`menu-icon menu-icon--${item.iconTone || 'neutral'}`}
                    >
                      <span className="menu-icon-emoji" aria-hidden="true">
                        {item.icon}
                      </span>
                    </span>
                    <span className="text-body">{item.label}</span>
                  </span>
                  <span className="flex gap-sm" style={{ alignItems: 'center' }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: item.badgeColor,
                          fontWeight: 500,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)' }}>{'>'}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="btn btn-danger mb-lg" onClick={() => setShowLogoutConfirm(true)}>
          Sign Out
        </button>

        <p className="text-center text-caption">tPay v1.0.0 (Sprint 3)</p>
      </div>

      {showLogoutConfirm && (
        <div
          className="loading-overlay"
          onClick={() => setShowLogoutConfirm(false)}
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="card"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <h2 className="text-title mb-md">Sign Out?</h2>
            <p className="text-body mb-lg" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex gap-sm">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
