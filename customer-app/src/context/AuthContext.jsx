import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, tokenManager, telemetry } from '../api/client';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

function mapTokenToUser(decodedToken) {
  return {
    id: decodedToken.sub,
    phone: decodedToken.phoneNumber,
    name: decodedToken.fullName,
    profileImage: decodedToken.profileImageUrl || null,
  };
}

function mapProfileToUser(profile, fallback = {}) {
  return {
    id: profile.id || fallback.id || '',
    phone: profile.phoneNumber || fallback.phone || '',
    name: profile.fullName || fallback.name || '',
    profileImage: profile.profileImageUrl !== undefined
      ? (profile.profileImageUrl || null)
      : (fallback.profileImage || null),
    kycTier: profile.kycTier ?? fallback.kycTier ?? 0,
  };
}

function getErrorMessage(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  if (Array.isArray(apiMessage) && apiMessage.length > 0) {
    return apiMessage[0];
  }
  if (typeof apiMessage === 'string') {
    return apiMessage;
  }
  return fallbackMessage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser((previousUser) => mapProfileToUser(profile, previousUser || {}));
      return { success: true, profile };
    } catch (error) {
      if (error?.response?.status === 401) {
        tokenManager.clear();
        setUser(null);
        setIsAuthenticated(false);
      }
      telemetry.error(error, { context: 'profile_refresh' });
      return {
        success: false,
        error: getErrorMessage(error, 'Unable to load profile'),
      };
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken();
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setIsAuthenticated(true);
          setUser(mapTokenToUser(decoded));
          const profileResult = await refreshProfile();
          if (profileResult.success) {
            telemetry.log('session_restored');
          }
        } catch (error) {
          tokenManager.clear();
          telemetry.error(error, { context: 'session_restore' });
        }
      }
      setIsLoading(false);
    };
    checkAuth();

    // Sync state when window is focused (for cross-tab/browser consistency)
    const handleFocus = () => {
      if (tokenManager.getToken()) {
        refreshProfile();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshProfile]);

  const login = async (phone, pin) => {
    try {
      const result = await authService.login(phone, pin);
      if (result.access_token) {
        const decoded = jwtDecode(result.access_token);
        setUser(mapTokenToUser(decoded));
        setIsAuthenticated(true);
        localStorage.setItem('tpay_phone', phone);
        await refreshProfile();
        telemetry.log('login_success');
        return { success: true };
      }
      throw new Error('No token received');
    } catch (error) {
      telemetry.log('login_failed', { reason: error.message });
      return {
        success: false,
        error: getErrorMessage(error, 'Login failed'),
      };
    }
  };

  const register = async (phone, name, pin) => {
    try {
      await authService.register(phone, name, pin);
      localStorage.setItem('tpay_phone', phone);
      telemetry.log('register_success');
      return { success: true };
    } catch (error) {
      telemetry.log('register_failed', { reason: error.message });
      return {
        success: false,
        error: getErrorMessage(error, 'Registration failed'),
      };
    }
  };

  const uploadProfileImage = async (imageData) => {
    try {
      const updatedProfile = await authService.uploadProfileImage(imageData);
      setUser((previousUser) =>
        mapProfileToUser(updatedProfile, previousUser || {}),
      );
      telemetry.log('profile_image_updated');
      return { success: true };
    } catch (error) {
      telemetry.log('profile_image_update_failed', { reason: error.message });
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to upload profile image'),
      };
    }
  };

  const removeProfileImage = async () => {
    try {
      const updatedProfile = await authService.removeProfileImage();
      setUser((previousUser) =>
        mapProfileToUser(updatedProfile, previousUser || {}),
      );
      telemetry.log('profile_image_removed');
      return { success: true };
    } catch (error) {
      telemetry.log('profile_image_remove_failed', { reason: error.message });
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to remove profile image'),
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    telemetry.log('logout');
  };

  const updateUserProfile = async (fullName, profileImage) => {
    try {
      const updatedProfile = await authService.updateProfile({ 
        fullName, 
        profileImageUrl: profileImage 
      });
      setUser((previousUser) =>
        mapProfileToUser(updatedProfile, previousUser || {}),
      );
      telemetry.log('profile_updated');
      return { success: true };
    } catch (error) {
      telemetry.log('profile_update_failed', { reason: error.message });
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to update profile'),
      };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshProfile,
    uploadProfileImage,
    removeProfileImage,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
