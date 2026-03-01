import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';

/**
 * Wraps routes that should only be accessible when NOT logged in.
 * If user is already authenticated, redirects to /main.
 */
const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #fff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? <Navigate to="/main" replace /> : <Outlet />;
};

export default PublicOnlyRoute;
