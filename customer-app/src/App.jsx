import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import BottomNav from './components/BottomNav';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WalletDashboard from './pages/WalletDashboard';
import SendMoney from './pages/SendMoney';
import TransactionHistory from './pages/TransactionHistory';
import ProfilePage from './pages/ProfilePage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import LanguageSettingsPage from './pages/LanguageSettingsPage';
import NotificationsSettingsPage from './pages/NotificationsSettingsPage';
import DevTools from './pages/DevTools';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page flex-center">
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Layout with Bottom Nav
function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <WalletDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/send" 
        element={
          <ProtectedRoute>
            <SendMoney />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <TransactionHistory />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/history/:id" 
        element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/profile/personal-info"
        element={
          <ProtectedRoute>
            <PersonalInfoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/language"
        element={
          <ProtectedRoute>
            <LanguageSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/notifications"
        element={
          <ProtectedRoute>
            <NotificationsSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dev-tools"
        element={
          <ProtectedRoute>
            <DevTools />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
