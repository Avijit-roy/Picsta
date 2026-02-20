import React, { useState, useRef, useEffect } from 'react';

const ResetPasswordOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) {
            value = value.slice(-1);
        }

        // Only allow numbers
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const digits = pastedData.match(/\d/g) || [];

        const newOtp = [...otp];
        digits.forEach((digit, index) => {
            if (index < 6) {
                newOtp[index] = digit;
            }
        });
        setOtp(newOtp);

        // Focus the next empty input or last input
        const nextEmptyIndex = newOtp.findIndex(val => !val);
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length === 6) {
            console.log('OTP submitted:', otpCode);
            // Handle OTP verification logic here
        }
    };

    return (
        <>
            <style>
                {`
                    .otp-container {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #ffffff;
                        padding: 20px;
                    }
                    
                    .otp-card {
                        width: 100%;
                        max-width: 450px;
                        padding: 40px 32px;
                        background-color: #ffffff;
                        border-radius: 12px;
                        border: 1px solid #dbdbdb;
                    }
                    
                    .otp-inputs {
                        display: flex;
                        gap: 12px;
                        justify-content: center;
                        margin-bottom: 24px;
                    }
                    
                    .otp-input {
                        width: 56px;
                        height: 56px;
                        font-size: 24px;
                        font-weight: 600;
                        text-align: center;
                        border: 1px solid #dbdbdb;
                        border-radius: 8px;
                        background-color: #fafafa;
                        outline: none;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        color: #262626;
                        transition: all 0.2s;
                        cursor: text;
                    }
                    
                    .otp-input:focus {
                        border-color: #a8a8a8;
                        background-color: #ffffff;
                    }
                    
                    @media (max-width: 480px) {
                        .otp-card {
                            padding: 32px 20px;
                        }
                        
                        .otp-inputs {
                            gap: 6px;
                        }
                        
                        .otp-input {
                            width: 45px;
                            height: 45px;
                            font-size: 20px;
                        }
                    }
                    
                    @media (max-width: 360px) {
                        .otp-inputs {
                            gap: 4px;
                        }
                        
                        .otp-input {
                            width: 40px;
                            height: 40px;
                            font-size: 18px;
                        }
                    }
                `}
            </style>
            <div className="otp-container">
                <div className="otp-card">
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#262626',
                        textAlign: 'center',
                        marginBottom: '12px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                        Reset password OTP
                    </h1>

                    <p style={{
                        fontSize: '14px',
                        color: '#737373',
                        textAlign: 'center',
                        marginBottom: '32px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                        Enter the 6-digit code sent to your email id.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="otp-input"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={otp.join('').length !== 6}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#ffffff',
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '50px',
                                cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                transition: 'all 0.2s',
                                opacity: otp.join('').length === 6 ? 1 : 0.6
                            }}
                            onMouseEnter={(e) => {
                                if (otp.join('').length === 6) {
                                    e.target.style.backgroundColor = '#374151';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#1f2937';
                            }}
                        >
                            Submit
                        </button>
                    </form>

                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#737373',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                        }}>
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    console.log('Resend OTP');
                                    // Handle resend OTP logic here
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0095f6',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '14px',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                                }}
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordOTP;