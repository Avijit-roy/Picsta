import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicOnlyRoute from './components/Auth/PublicOnlyRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmailPage from './components/Auth/VerifyEmailPage';
import VerifyEmailPendingPage from './components/Auth/VerifyEmailPendingPage';
import MainPage from './components/MainPage/MainPage';
import NewPassword from './components/PasswordReset/NewPassword';
import ResetPassword from './components/PasswordReset/ResetPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public-only: redirect to /main if already logged in */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/new-password" element={<NewPassword />} />
          </Route>

          {/* Protected: redirect to /login if not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/main" element={<MainPage />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Helper to redirect '/' correctly based on auth state
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a spinner
  return user ? <Navigate to="/main" replace /> : <Navigate to="/login" replace />;
};

export default App;
