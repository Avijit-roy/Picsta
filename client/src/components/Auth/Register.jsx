import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import Footer from "./Footer";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthdayMonth, setBirthdayMonth] = useState("");
    const [birthdayDay, setBirthdayDay] = useState("");
    const [birthdayYear, setBirthdayYear] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validate = () => {
        const errors = {};
        
        const unifiedRegex = /^(?![_])(?!.*__)(?![a-z0-9_]*_$)[a-z0-9_]{4,20}$/;
        const reserved = ['admin', 'support', 'picsta', 'official', 'moderator', 'staff'];

        // Name validation
        if (!fullName) {
            errors.fullName = "Name is required";
        } else {
            const normalizedName = fullName.trim().toLowerCase();
            if (!unifiedRegex.test(normalizedName) || !/[a-z]/.test(normalizedName)) {
                errors.fullName = "Name must be 4-20 chars, use only letters/numbers/underscores, and have at least one letter";
            } else if (reserved.includes(normalizedName)) {
                errors.fullName = "This name is reserved";
            }
        }

        // Username validation
        if (!username) {
            errors.username = "Username is required";
        } else {
            const usernamePart = username.substring(1).toLowerCase();
            if (usernamePart.length < 4 || usernamePart.length > 20) {
                errors.username = "Username must be 4-20 characters long (after @)";
            } else if (!unifiedRegex.test(usernamePart) || !/[a-z]/.test(usernamePart)) {
                errors.username = "Username must use only letters/numbers/underscores, and have at least one letter";
            } else if (reserved.includes(usernamePart)) {
                errors.username = "This username is reserved";
            }
        }

        // Email validation
        if (!email) {
            errors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            errors.email = "Invalid email format";
        }

        // Password validation
        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        }

        // Age validation
        if (birthdayYear && birthdayMonth && birthdayDay) {
            const birthDate = new Date(`${birthdayYear}-${birthdayMonth.padStart(2, '0')}-${birthdayDay.padStart(2, '0')}`);
            const age = Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 13) {
                errors.birthday = "You must be at least 13 years old";
            }
        } else {
            errors.birthday = "Please complete your birthday";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNameChange = (e) => {
        let value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/__+/g, '_');
        if (value.length > 20) value = value.substring(0, 20);
        setFullName(value);
        if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: null }));
    };

    const handleUsernameChange = (e) => {
        let value = e.target.value;
        if (!value.startsWith('@')) {
            value = '@' + value.replace(/[@]/g, '');
        }
        const prefix = value.charAt(0);
        const rest = value.substring(1).toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/__+/g, '_');
        value = prefix + rest;
        if (value.length > 21) value = value.substring(0, 21);
        setUsername(value);
        if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!validate()) return;
        
        setLoading(true);
        const dob = `${birthdayYear}-${birthdayMonth.padStart(2, '0')}-${birthdayDay.padStart(2, '0')}`;

        try {
            await authService.register({
                name: fullName.trim(),
                username: username.trim().toLowerCase(),
                email: email.trim().toLowerCase(),
                password,
                dob
            });

            navigate('/verify-email-pending', { state: { email: email } });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            console.error("Registration error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.bodyly}>
                <div className={styles["container-main"]}>
                    <h5 className={styles.heading}>Get started on Picsta ✨</h5>
                    <p className={styles.subtitle}>
                        Sign up to see photos and videos from your friends.
                    </p>

                    {error && <div className="alert alert-danger py-2" role="alert" style={{ borderRadius: '10px', fontSize: '14px', marginBottom: '20px' }}>{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Email</label>
                            <input
                                type="email"
                                className={`${styles["form-control"]} ${fieldErrors.email ? styles.error : ""}`}
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                                }}
                                required
                            />
                            {fieldErrors.email && <span className={styles["error-text"]}>{fieldErrors.email}</span>}
                        </div>
                        <div className={styles["info-text"]}>
                            You may receive notifications from us.{" "}
                            <a href="#">Learn why we ask for your contact information</a>
                        </div>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Password</label>
                            <input
                                type="password"
                                className={`${styles["form-control"]} ${fieldErrors.password ? styles.error : ""}`}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                                }}
                                minLength="8"
                                required
                            />
                            {fieldErrors.password && <span className={styles["error-text"]}>{fieldErrors.password}</span>}
                        </div>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles["birthday-label"]} ${styles.required}`}>
                                Birthday
                                <span
                                    className={styles["info-icon"]}
                                    title="We use your birthday for security and personalization purposes."
                                >
                                    ?
                                </span>
                            </label>
                            <div className={styles["birthday-row"]}>
                                <select
                                    className={`${styles["form-select"]} ${fieldErrors.birthday ? styles.error : ""}`}
                                    value={birthdayMonth}
                                    onChange={(e) => {
                                        setBirthdayMonth(e.target.value);
                                        if (fieldErrors.birthday) setFieldErrors(prev => ({ ...prev, birthday: null }));
                                    }}
                                    required
                                >
                                    <option value="" disabled>Month</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                                <select
                                    className={`${styles["form-select"]} ${fieldErrors.birthday ? styles.error : ""}`}
                                    value={birthdayDay}
                                    onChange={(e) => {
                                        setBirthdayDay(e.target.value);
                                        if (fieldErrors.birthday) setFieldErrors(prev => ({ ...prev, birthday: null }));
                                    }}
                                    required
                                >
                                    <option value="" disabled>Day</option>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className={`${styles["form-select"]} ${fieldErrors.birthday ? styles.error : ""}`}
                                    value={birthdayYear}
                                    onChange={(e) => {
                                        setBirthdayYear(e.target.value);
                                        if (fieldErrors.birthday) setFieldErrors(prev => ({ ...prev, birthday: null }));
                                    }}
                                    required
                                >
                                    <option value="" disabled>Year</option>
                                    {[...Array(100)].map((_, i) => {
                                        const year = new Date().getFullYear() - i;
                                        return (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            {fieldErrors.birthday && <span className={styles["error-text"]}>{fieldErrors.birthday}</span>}
                        </div>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Name</label>
                            <input
                                type="text"
                                className={`${styles["form-control"]} ${fieldErrors.fullName ? styles.error : ""}`}
                                placeholder="Full name"
                                value={fullName}
                                onChange={handleNameChange}
                                required
                                autoComplete="off"
                            />
                            {fieldErrors.fullName && <span className={styles["error-text"]}>{fieldErrors.fullName}</span>}
                        </div>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Username</label>
                            <input
                                type="text"
                                className={`${styles["form-control"]} ${fieldErrors.username ? styles.error : ""}`}
                                placeholder="@username"
                                value={username}
                                onChange={handleUsernameChange}
                                required
                                style={{ fontFamily: "'DM Mono', monospace" }}
                                autoComplete="off"
                            />
                            {fieldErrors.username && <span className={styles["error-text"]}>{fieldErrors.username}</span>}
                        </div>
                        <div className={styles["terms-text"]}>
                            By tapping Submit, you agree to create an account and to Instagram's{" "}
                            <a href="#">Terms</a>, <a href="#">Privacy Policy</a> and{" "}
                            <a href="#">Cookies Policy</a>.<br />
                            <br />
                            The <a href="#">Privacy Policy</a> describes the ways we can use the
                            information we collect when you create an account. For example, we use
                            this information to provide, personalize and improve our products,
                            including ads.
                        </div>
                        <button
                            type="submit"
                            className={styles["submit-btn"]}
                            style={{ borderRadius: "20px" }}
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                        <Link to="/login" className={styles["login-link"]} style={{ borderRadius: "20px", textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                            I already have an account
                        </Link>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Register;