import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tpay_notification_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem('tpay_notification_unread');
    return saved ? parseInt(saved) : 0;
  });
  const socketRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const notify = useCallback((message, type = 'info', data = {}, options = {}) => {
    const { noBadge = false, noHistory = false, sound = true } = options;
    const id = Date.now();
    
    // Wrap message in t() if it's a key
    const displayMessage = message.includes('notifications.') ? t(message.split(':')[0]) + (message.includes(':') ? ': ' + message.split(':').slice(1).join(':') : '') : message;
    
    const newNotification = { id, message: displayMessage, rawMessage: message, type, timestamp: new Date().toISOString(), data, read: false };
    
    // Add to toast notifications (fleeting)
    setNotifications(prev => [...prev, { id, message: displayMessage, type }]);
    
    if (!noHistory) {
      // Add to history (persistent)
      setHistory(prev => {
        const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
        localStorage.setItem('tpay_notification_history', JSON.stringify(updated));
        return updated;
      });
    }

    if (!noBadge) {
      // Update unread count
      setUnreadCount(prev => {
        const updated = prev + 1;
        localStorage.setItem('tpay_notification_unread', updated.toString());
        return updated;
      });
    }

    // Play sound based on type
    if (sound) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.warn('[Sound] Blocked by browser:', e.message));
      } catch (e) {
        console.warn('[Sound] Error playing notification sound:', e);
      }
    }
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [t]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
    localStorage.setItem('tpay_notification_unread', '0');
    setHistory(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('tpay_notification_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tpay_notification_unread') {
        const newVal = e.newValue ? parseInt(e.newValue) : 0;
        setUnreadCount(newVal);
      }
      if (e.key === 'tpay_notification_history') {
        setHistory(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('tpay_token');
    const phoneNumber = localStorage.getItem('tpay_phone');

    if (!token && !phoneNumber) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect or Re-connect if auth state changed (e.g. guest -> logged in)
    const isActuallyAuthenticated = !!token && isAuthenticated;
    const currentConnectionIsGuest = socketRef.current?.connected && !socketRef.current.auth?.token;

    if (socketRef.current?.connected && !(isActuallyAuthenticated && currentConnectionIsGuest)) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const authUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/notifications' 
      : 'https://tpay-auth-api.onrender.com/notifications';

    const newSocket = io(authUrl, {
      auth: { 
        token: isActuallyAuthenticated ? token : null, 
        phoneNumber: phoneNumber?.replace(/[\s-]/g, '') 
      },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log(`>>> [Socket] Connected to notifications center (${isActuallyAuthenticated ? 'Authenticated' : 'Guest'})`);
    });
    
    newSocket.on('notification', (data) => {
      console.log('>>> [Socket] Received notification:', data);
      
      const typeMap = {
        'TRANSFER_RECEIVED': 'received',
        'TRANSFER_SENT': 'success',
        'error': 'error'
      };

      // For TRANSFER_SENT, we only want sound and toast, NO history/badge (user's request)
      const options = {
        noBadge: data.type === 'TRANSFER_SENT',
        noHistory: data.type === 'TRANSFER_SENT'
      };

      notify(data.message, typeMap[data.type] || 'info', data, options);
    });

    socketRef.current = newSocket;

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [isAuthenticated, notify]);

  return (
    <NotificationContext.Provider value={{ notify, history, unreadCount, markAsRead }}>
      {children}
      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification-toast ${n.type} animate-fade-in`}>
            <div className="notification-content">
              {n.type === 'success' && <span className="mr-sm">✅</span>}
              {n.type === 'error' && <span className="mr-sm">⚠️</span>}
              {n.type === 'received' && <span className="mr-sm">💰</span>}
              <span>{n.message}</span>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
