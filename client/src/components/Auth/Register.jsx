import { useState } from "react";
import styles from "./Register.module.css";
import Footer from "./Footer";

const Register = () => {
    const [emailOrMobile, setEmailOrMobile] = useState("");
    const [password, setPassword] = useState("");
    const [birthdayMonth, setBirthdayMonth] = useState("");
    const [birthdayDay, setBirthdayDay] = useState("");
    const [birthdayYear, setBirthdayYear] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    return (
        <>
            <div className={styles.bodyly}>
                <div className={styles["container-main"]}>

                    <h5 className={styles.heading}>Get started on Picsta ✨</h5>
                    <p className={styles.subtitle}>
                        Sign up to see photos and videos from your friends.
                    </p>
                    <form>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Email</label>
                            <input
                                type="text"
                                className={`${styles["form-control"]} ${styles.required}`}
                                placeholder="Email"
                                value={emailOrMobile}
                                onChange={(e) => setEmailOrMobile(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles["info-text"]}>
                            You may receive notifications from us.{" "}
                            <a href="#">Learn why we ask for your contact information</a>
                        </div>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Password</label>
                            <input
                                type="password"
                                className={`${styles["form-control"]} ${styles.required}`}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
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
                                    className={`${styles["form-select"]} ${styles.required}`}
                                    value={birthdayMonth}
                                    onChange={(e) => setBirthdayMonth(e.target.value)}
                                    required
                                >
                                    <option value="" defaultValue>Month</option>
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
                                    className={`${styles["form-select"]} ${styles.required}`}
                                    value={birthdayDay}
                                    onChange={(e) => setBirthdayDay(e.target.value)}
                                    required
                                >
                                    <option value="" defaultValue>Day</option>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className={`${styles["form-select"]} ${styles.required}`}
                                    value={birthdayYear}
                                    onChange={(e) => setBirthdayYear(e.target.value)}
                                    required
                                >
                                    <option value="" defaultValue>Year</option>
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
                        </div>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Name</label>
                            <input
                                type="text"
                                className={`${styles["form-control"]} ${styles.required}`}
                                placeholder="Full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles["mb-3"]}>
                            <label className={`${styles["form-label"]} ${styles.required}`}>Username</label>
                            <input
                                type="text"
                                className={`${styles["form-control"]} ${styles.required}`}
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
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
                        >
                            Submit
                        </button>
                        <button type="button" className={styles["login-link"]} style={{ borderRadius: "20px" }}>
                            I already have an account
                        </button>
                    </form>
                </div>
            </div>
            <Footer />

        </>
    );
};

export default Register;