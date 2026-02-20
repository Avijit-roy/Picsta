import React, { useState } from 'react';
import Footer from '../Auth/Footer';

const ResetPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle password reset logic here
        console.log('Reset password for:', email);
    };

    return (
        <>
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                padding: '20px'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '388px',
                    padding: '40px 32px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #dbdbdb'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#262626',
                        textAlign: 'center',
                        marginBottom: '12px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                        Reset password
                    </h1>

                    <p style={{
                        fontSize: '14px',
                        color: '#737373',
                        textAlign: 'center',
                        marginBottom: '32px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                        Enter your registered email address
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    placeholder="Email id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        fontSize: '14px',
                                        border: '1px solid #dbdbdb',
                                        borderRadius: '50px',
                                        backgroundColor: '#fafafa',
                                        outline: 'none',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                        color: '#262626',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#a8a8a8'}
                                    onBlur={(e) => e.target.style.borderColor = '#dbdbdb'}
                                />
                                <svg
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '16px',
                                        height: '16px'
                                    }}
                                    fill="#8e8e8e"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                                </svg>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#ffffff',
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2a3a52'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#1f2937'}
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;