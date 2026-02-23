import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setError('No verification token found. Please check your email link.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        if (response.success) {
          setStatus('success');
          // Auto-login with the data returned from backend
          login(response.data.user);
          
          // Redirect to main after a short delay to show success state
          setTimeout(() => {
            navigate('/main');
          }, 2000);
        }
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    verify();
  }, [searchParams, login, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', textAlign: 'center', padding: '20px' }}>
        {status === 'verifying' && (
          <>
            <div className="spinner-border text-primary mb-4" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2>Verifying your email...</h2>
            <p style={{ color: '#8e8e8e' }}>Please wait while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '64px', color: '#28a745', marginBottom: '20px' }}>✓</div>
            <h2>Email Verified!</h2>
            <p style={{ color: '#8e8e8e' }}>Your account has been successfully activated. Redirecting you to Picsta...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '64px', color: '#dc3545', marginBottom: '20px' }}>✕</div>
            <h2>Verification Failed</h2>
            <p style={{ color: '#8e8e8e', marginBottom: '30px' }}>{error}</p>
            <button 
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#0095f6',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
