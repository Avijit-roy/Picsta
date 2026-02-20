import { useState } from 'react';
import styles from './Login.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Footer';
import backgroundImage from '../../assets/pexels-debora-silva-2149722460-32678993.jpg';

const Login = () => {
    // State for each required field
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Placeholder for authentication logic
        console.log('Form submitted with:', { email, password });

        // Simulate done loading
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <>
            <div className={`${styles["login-wrapper"]} ${styles.bodyly}`}>
                {/* Background Image - Left Side */}
                <div className={styles["login-image-section"]}>
                    <div className={styles["floral-image"]}>
                        <img
                            src={backgroundImage}
                            alt="Floral background"
                            className={styles["main-image"]}
                        />
                        {/* Floating Card */}
                        <div className={styles["floating-card"]}>
                            <div className={styles["card-image"]}>
                                <img
                                    src="https://wpspeedmatters.com/wp-content/uploads/2019/12/chat-bubbles.jpg"
                                    alt="Welcome"
                                />
                            </div>
                            <div className={styles["card-content"]}>
                                <h3>Welcome Back 👋</h3>
                                <p>Tailor to a new way. It's your day. You changed it. Sign in to start managing your projects.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Form - Right Side */}
                <div className={styles["login-form-section"]}>
                    <div className={styles["form-wrapper"]}>
                        {/* Welcome Header */}
                        <div className={styles["welcome-header"]}>
                            <h1>Welcome Back 👋</h1>
                            <p className={styles["welcome-subtitle"]}>
                                Tailor to a new way. It's your day. You changed it. Sign in to start managing your projects.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className={styles["error-alert"]}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className={styles["login-form"]}>
                            {/* Email/Username Input */}
                            <div className={styles["form-field"]}>
                                <label htmlFor="email" className={`${styles["form-label"]} ${styles.required}`}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="text"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles["input-field"]}
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className={styles["form-field"]}>
                                <label htmlFor="password" className={`${styles["form-label"]} ${styles.required}`}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles["input-field"]}
                                    required
                                />
                            </div>

                            {/* Forgot Password Link */}
                            <div className={styles["form-footer"]}>
                                <a href="#" className={styles["forgot-password-link"]}>
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles["signin-button"]}
                            >
                                {loading ? (
                                    <>
                                        <span className={styles["spinner-small"]}></span>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className={styles["divider"]}>
                            <span>OR</span>
                        </div>

                        {/* Social Login Buttons */}
                        <div className={styles["social-buttons"]}>
                            <button type="button" className={`${styles["social-button"]} ${styles["google-button"]}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button type="button" className={`${styles["social-button"]} ${styles["facebook-button"]}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className={styles["signup-section"]}>
                            <p>Don't you have an account? <a href="#" className={styles["signup-link"]}>Sign up</a></p>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;