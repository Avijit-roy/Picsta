import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking session
  const navigate = useNavigate();

  // On app mount: try to restore session via refresh token cookie
  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/refresh');
      if (data.success) {
        setUser(data.data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Handle bfcache: re-validate session when restored from history
  useEffect(() => {
    const handlePageshow = (event) => {
      if (event.persisted) {
        restoreSession();
      }
    };
    window.addEventListener('pageshow', handlePageshow);
    return () => window.removeEventListener('pageshow', handlePageshow);
  }, [restoreSession]);

  // Listen for forced logout events from the axios interceptor
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [navigate]);

  // Called after successful login or register
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Called on logout button click
  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch {
      // Even if API fails, clear local state
    }
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
