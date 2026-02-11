import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { isDark, toggleTheme } = useTheme();
  const { t, currentLanguage } = useLanguage();
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
      title: t('profile.account') || 'Account',
      items: [
        {
          icon: '\u{1F464}',
          iconTone: 'plum',
          label: t('profile.personalInfo'),
          action: () => navigate('/profile/personal-info'),
        },
        {
          icon: '\u{1F512}',
          iconTone: 'amber',
          label: t('profile.security'),
          action: () => {},
        },
        {
          icon: '\u{1F4CB}',
          iconTone: 'mint',
          label: t('profile.kyc'),
          badge: t('profile.verified'),
          badgeColor: 'var(--success)',
          action: () => {},
        },
      ],
    },
    {
      title: t('profile.linkedAccounts') || 'Linked Accounts',
      items: [
        {
          icon: '\u{1F3E6}',
          iconTone: 'indigo',
          label: t('profile.bankAccounts'),
          badge: t('profile.comingSoon'),
          badgeColor: 'var(--text-muted)',
          action: () => {},
        },
        {
          icon: '\u{1F4F1}',
          iconTone: 'sky',
          label: t('profile.mobileMoney'),
          badge: t('profile.comingSoon'),
          badgeColor: 'var(--text-muted)',
          action: () => {},
        },
      ],
    },
    {
      title: t('profile.preferences') || 'Preferences',
      items: [
        {
          icon: '\u{1F514}',
          iconTone: 'amber',
          label: t('profile.notifications'),
          action: () => navigate('/profile/notifications'),
        },
        {
          icon: '\u{1F319}',
          iconTone: 'slate',
          label: t('profile.darkMode'),
          toggle: true,
          action: () => toggleTheme(),
        },
        {
          icon: '\u{1F310}',
          iconTone: 'teal',
          label: t('profile.language'),
          badge: (
            <span className="flex gap-xs" style={{ alignItems: 'center' }}>
              <img 
                src={`https://flagcdn.com/w40/${currentLanguage?.region}.png`} 
                alt="" 
                style={{ width: 16, height: 12, borderRadius: 2, objectFit: 'cover' }} 
              />
              {currentLanguage?.name || 'English'}
            </span>
          ),
          action: () => navigate('/profile/language'),
        },
      ],
    },
    {
      title: t('profile.support') || 'Support',
      items: [
        {
          icon: '\u{1F198}',
          iconTone: 'sky',
          label: t('profile.helpCenter'),
          action: () => {},
        },
        {
          icon: '\u{1F4AC}',
          iconTone: 'rose',
          label: t('profile.contactSupport'),
          action: () => {},
        },
        {
          icon: '\u{1F4C4}',
          iconTone: 'sage',
          label: t('profile.termsPrivacy'),
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <BackButton />
        <h1 className="page-title">{t('profile.title')}</h1>
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
              {isRemovingImage ? t('common.loading') : t('profile.removePhoto') || 'Remove Photo'}
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
              {t('profile.verified')}
            </span>
          </div>
        </div>

        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-sm">
            <p className="text-caption" style={{ paddingLeft: '4px' }}>
              {section.title}
            </p>
            <div className="card" style={{ padding: 0 }}>
              {section.items.map((item, itemIndex) => {
                const isToggleItem = !!item.toggle;
                const RowComponent = isToggleItem ? 'div' : 'button';
                
                return (
                  <RowComponent
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
                      textAlign: 'inherit',
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
                      {isToggleItem ? (
                        <button
                          className={`theme-toggle ${isDark ? 'active' : ''}`}
                          aria-label="Toggle dark mode"
                          onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                        />
                      ) : (
                        <>
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
                        </>
                      )}
                    </span>
                  </RowComponent>
                );
              })}
            </div>
          </div>
        ))}

        <button className="btn btn-danger mt-lg mb-lg" onClick={() => setShowLogoutConfirm(true)}>
          {t('profile.signOut')}
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
            <h2 className="text-title mb-md">{t('profile.signOut')}?</h2>
            <p className="text-body mb-lg" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex gap-sm">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                {t('common.cancel')}
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                {t('profile.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
