import axios from 'axios';

// API Client Configuration
const authApi = axios.create({
  baseURL: '/api/auth',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

const walletApi = axios.create({
  baseURL: '/api/wallet',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Token Management
const TOKEN_KEY = 'tpay_token';
const REFRESH_KEY = 'tpay_refresh';
const MAX_TOKEN_LENGTH = 3000;

function getSafeToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }

  // Prevent repeated 431s if a legacy token was bloated by embedded image data.
  if (token.length > MAX_TOKEN_LENGTH) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    return null;
  }

  return token;
}

export const tokenManager = {
  getToken: () => getSafeToken(),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token) => localStorage.setItem(REFRESH_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};

// Add auth header to auth requests when token exists
authApi.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add auth header to wallet requests
walletApi.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
walletApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      tokenManager.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============

export const authService = {
  // Register with phone
  register: async (phone, name, pin) => {
    // Format phone to +211XXXXXXXXX
    const formattedPhone = phone.replace(/[\s-]/g, '');
    const response = await authApi.post('/signup', { 
      phoneNumber: formattedPhone, 
      fullName: name,
      pin 
    });
    return response.data;
  },

  // Request OTP
  requestOtp: async (phone) => {
    const response = await authApi.post('/otp/request', { phone });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (phone, otp) => {
    const response = await authApi.post('/otp/verify', { phone, otp });
    return response.data;
  },

  // Set PIN
  setPin: async (phone, pin) => {
    const response = await authApi.post('/pin/set', { phone, pin });
    return response.data;
  },

  // Login with phone + PIN
  login: async (phone, pin) => {
    const formattedPhone = phone.replace(/[\s-]/g, '');
    const response = await authApi.post('/login', { phoneNumber: formattedPhone, pin });
    const token = response.data.access_token || response.data.token;
    if (token) {
      tokenManager.setToken(token);
      if (response.data.refreshToken) {
        tokenManager.setRefresh(response.data.refreshToken);
      }
    }
    return response.data;
  },

  // Get current authenticated user profile
  getProfile: async () => {
    const response = await authApi.get('/profile');
    return response.data;
  },

  // Upload or replace profile image
  uploadProfileImage: async (imageData) => {
    const response = await authApi.post('/profile/image', { imageData });
    return response.data;
  },

  // Remove profile image
  removeProfileImage: async () => {
    const response = await authApi.delete('/profile/image');
    return response.data;
  },

  // Update profile details (name, picture)
  updateProfile: async (data) => {
    const response = await authApi.patch('/profile', data);
    return response.data;
  },

  // Logout
  logout: () => {
    tokenManager.clear();
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!tokenManager.getToken();
  }
};

// ============ WALLET API ============

export const walletService = {
  // Get or create wallet for current user
  getMyWallet: async () => {
    const response = await walletApi.get('/wallets/me');
    return response.data;
  },

  // Get balance
  getBalance: async (walletId) => {
    const response = await walletApi.get(`/wallets/${walletId}/balance`);
    return response.data;
  },

  // Get transaction history
  getHistory: async (walletId, params = {}) => {
    const response = await walletApi.get(`/wallets/${walletId}/history`, { params });
    return response.data;
  },

  // Execute P2P transfer
  sendMoney: async (senderWalletId, recipientPhone, amount, description) => {
    const idempotencyKey = `p2p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const response = await walletApi.post('/transfers/p2p', {
      idempotencyKey,
      senderWalletId,
      recipientPhone,
      amount: parseFloat(amount),
      description
    });
    return response.data;
  },

  // Get transaction receipt
  getReceipt: async (transactionId) => {
    const response = await walletApi.get(`/transfers/${transactionId}/receipt`);
    return response.data;
  }
};

// ============ TELEMETRY (Non-PII) ============

export const telemetry = {
  log: (event, data = {}) => {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('session_id') || 'unknown',
      ...data
    };
    // In production, send to analytics endpoint
    console.log('[Telemetry]', payload);
  },

  error: (error, context = {}) => {
    const payload = {
      type: 'error',
      message: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString(),
      ...context
    };
    console.error('[Crash Report]', payload);
    // In production, send to crash reporting service
  }
};

// Initialize session ID
if (!sessionStorage.getItem('session_id')) {
  sessionStorage.setItem('session_id', `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
}
