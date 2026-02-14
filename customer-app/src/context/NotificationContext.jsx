import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  const notify = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('tpay_token');
    if (!token || !isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const authUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/notifications' 
      : 'https://tpay-auth-api.onrender.com/notifications';

    const newSocket = io(authUrl, {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => console.log('>>> [Socket] Connected to notifications'));
    
    newSocket.on('notification', (data) => {
      console.log('>>> [Socket] Received notification:', data);
      
      const typeMap = {
        'TRANSFER_RECEIVED': 'received',
        'TRANSFER_SENT': 'success',
        'error': 'error'
      };

      notify(data.message, typeMap[data.type] || 'info', 5000);
      
      // Potential: play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) { /* sound block by browser */ }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, notify]); // Dependencies are correct

  return (
    <NotificationContext.Provider value={{ notify }}>
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
