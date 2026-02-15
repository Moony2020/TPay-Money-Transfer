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

  const notify = useCallback((message, type = 'info', data = {}) => {
    const id = Date.now();
    // Wrap message in t() if it's a key
    const displayMessage = message.includes('notifications.') ? t(message.split(':')[0]) + (message.includes(':') ? ': ' + message.split(':').slice(1).join(':') : '') : message;
    
    const newNotification = { id, message: displayMessage, rawMessage: message, type, timestamp: new Date().toISOString(), data, read: false };
    
    // Add to toast notifications (fleeting)
    setNotifications(prev => [...prev, { id, message: displayMessage, type }]);
    
    // Add to history (persistent)
    setHistory(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('tpay_notification_history', JSON.stringify(updated));
      return updated;
    });

    // Update unread count
    setUnreadCount(prev => {
      const updated = prev + 1;
      localStorage.setItem('tpay_notification_unread', updated.toString());
      return updated;
    });

    // Play sound based on type
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.warn('[Sound] Blocked by browser:', e.message));
    } catch (e) {
      console.warn('[Sound] Error playing notification sound:', e);
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
    const token = localStorage.getItem('tpay_token');
    const phoneNumber = localStorage.getItem('tpay_phone');

    if (!token && !phoneNumber) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Only connect if not already connected
    if (socketRef.current?.connected) return;

    const authUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/notifications' 
      : 'https://tpay-auth-api.onrender.com/notifications';

    const newSocket = io(authUrl, {
      auth: { 
        token, 
        phoneNumber: phoneNumber?.replace(/[\s-]/g, '') 
      },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('>>> [Socket] Connected to notifications center');
    });
    
    newSocket.on('notification', (data) => {
      console.log('>>> [Socket] Received notification:', data);
      
      const typeMap = {
        'TRANSFER_RECEIVED': 'received',
        'TRANSFER_SENT': 'success',
        'error': 'error'
      };

      notify(data.message, typeMap[data.type] || 'info', data);
    });

    socketRef.current = newSocket;

    return () => {
      if (newSocket) newSocket.disconnect();
      socketRef.current = null;
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
