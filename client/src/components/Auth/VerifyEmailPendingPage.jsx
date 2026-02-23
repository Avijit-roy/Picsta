import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css'; // Assuming common auth styles
import authService from '../../services/authService';

const VerifyEmailPendingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState({ type: '', text: '' });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setResendMessage({ type: '', text: '' });
    
    try {
      await authService.resendVerification(email);
      setResendMessage({ type: 'success', text: 'Verification email resent! Please check your inbox.' });
      setCountdown(60); // 60s cooldown
    } catch (err) {
      setResendMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to resend email. Please try again later.' 
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className={styles.authContainer} style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div className={styles.authCard} style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '12px', border: '1px solid #333' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>Verify your email</h2>
        <p style={{ color: '#8e8e8e', marginBottom: '24px', lineHeight: '1.5' }}>
          We've sent a verification link to <br />
          <strong style={{ color: '#fff' }}>{email}</strong>
        </p>
        <p style={{ color: '#8e8e8e', marginBottom: '32px', fontSize: '14px' }}>
          Please click the link in the email to activate your Picsta account.
        </p>

        {resendMessage.text && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            fontSize: '14px',
            backgroundColor: resendMessage.type === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
            color: resendMessage.type === 'success' ? '#28a745' : '#dc3545',
            border: `1px solid ${resendMessage.type === 'success' ? '#28a74533' : '#dc354533'}`
          }}>
            {resendMessage.text}
          </div>
        )}

        <button 
          onClick={handleResend}
          disabled={resendLoading || countdown > 0}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: countdown > 0 ? '#333' : '#0095f6',
            color: '#fff',
            border: 'none',
            fontWeight: '600',
            cursor: (resendLoading || countdown > 0) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
        </button>
        
        <div style={{ marginTop: '24px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#0095f6', cursor: 'pointer', fontSize: '14px' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPendingPage;
