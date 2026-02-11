import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image too large. Maximum size is 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateUserProfile(fullName, profileImage);
    
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } else {
      setError(result.error || 'Failed to update profile');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <BackButton />
        <h1 className="page-title">Personal Information</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="page-content">
        {/* Profile Picture Section */}
        <div className="card mb-lg" style={{ textAlign: 'center' }}>
          <p className="text-caption mb-md">Profile Picture</p>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              backgroundColor: profileImage ? 'transparent' : 'var(--primary)',
              backgroundImage: profileImage ? `url(${profileImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 600,
              border: '3px solid var(--border)'
            }}>
              {!profileImage && (user?.name?.[0] || user?.phone?.[0] || 'U')}
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                border: '2px solid var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              +
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {profileImage && (
            <button
              className="btn btn-secondary mt-md"
              onClick={handleRemoveImage}
              style={{ maxWidth: '200px' }}
            >
              Remove Picture
            </button>
          )}

          <p className="text-caption mt-sm" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            Maximum size: 2MB
          </p>
        </div>

        {/* Personal Info Form */}
        <div className="card mb-lg">
          <div className="mb-md">
            <label className="text-caption mb-xs" style={{ display: 'block' }}>Full Name</label>
            <input
              type="text"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="mb-md">
            <label className="text-caption mb-xs" style={{ display: 'block' }}>Phone Number</label>
            <input
              type="text"
              className="input"
              value={user?.phone || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p className="text-caption mt-xs" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              Phone number cannot be changed
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="card mb-md" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)' }}>
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: 0 }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {success && (
          <div className="card mb-md" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'var(--success)' }}>
            <p style={{ color: 'var(--success)', fontSize: '0.875rem', margin: 0 }}>
              ✓ Profile updated successfully!
            </p>
          </div>
        )}

        {/* Save Button */}
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
