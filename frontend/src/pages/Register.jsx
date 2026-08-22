import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import whisk from "../assets/whisk.webp";
import logo from "../assets/logo.png";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [pendingEmail, setPendingEmail] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const validateForm = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field) =>
    setErrors((p) => (p[field] ? { ...p, [field]: "" } : p));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await api.post("/register", {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });
      setPendingEmail(res.data.email);
      setResendTimer(30);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Registration failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async () => {
    if (!otpCode.trim()) { setOtpError("empty"); return; }
    setVerifying(true);
    setOtpError("");
    try {
      const res = await api.post("/otp/verify", { email: pendingEmail, code: otpCode });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch {
      setOtpError("wrong");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post("/otp/resend", { email: pendingEmail });
      setResendTimer(30);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to resend code");
    }
  };

  const inputClass = (field) =>
    `auth-input${errors[field] ? " auth-input--error" : ""}`;

  return (
    <div className="auth-shell" style={{ minHeight: "92vh" }}>
     
      <aside className="auth-art">
        <div className="auth-art__blob" aria-hidden="true" />
        <img src={whisk} alt="" className="food72" />

        <div className="auth-art__copy">
          <p className="auth-art__eyebrow">Join Recipia</p>
          <h2 className="auth-art__title">Whisk up<br />something new.</h2>
        </div>
      </aside>
      <main className="login">
        <div className="auth-panel__inner">
          <Link to="/" className="auth-brand">
            <img src={logo} alt="Recipia" className="auth-brand__logo" />
            <span className="auth-brand__word">ecipia</span>
          </Link>

          {pendingEmail ? (
            <>
              <h1 className="auth-heading">Verify your email</h1>
              <p className="auth-sub">
                We sent a 5-digit code to <strong>{pendingEmail}</strong>. Enter it below to finish
                creating your account.
              </p>

              <div className="auth-form">
                <input
                  className="auth-otp__input"
                  inputMode="numeric"
                  maxLength={5}
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                  autoFocus
                />

                {otpError === "wrong" && <p className="auth-error">Wrong code. Please try again.</p>}
                {otpError === "empty" && <p className="auth-error">Please enter the code.</p>}
                {otpError && otpError !== "wrong" && otpError !== "empty" && (
                  <p className="auth-error">{otpError}</p>
                )}

                <button type="button" onClick={verify} className="auth-btn auth-btn--yellow" disabled={verifying}>
                  {verifying ? "Verifying…" : "Verify & Create Account"}
                </button>

                <button
                  type="button"
                  className={`auth-link-btn${resendTimer > 0 ? " is-muted" : ""}`}
                  disabled={resendTimer > 0}
                  onClick={resend}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                </button>

                <button type="button" className="auth-link-btn" onClick={() => setPendingEmail(null)}>
                  ← Back to registration form
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="auth-heading">Create your account</h1>
              <p className="auth-sub">Join Recipia and start sharing recipes.</p>

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {errors.general && <p className="auth-alert">{errors.general}</p>}

                <div className="auth-row">
                  <label className="auth-field">
                    <span className="auth-field__label">First name</span>
                    <input
                      className={inputClass("firstName")}
                      placeholder="Ada"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                    />
                    {errors.firstName && <p className="auth-error">{errors.firstName}</p>}
                  </label>

                  <label className="auth-field">
                    <span className="auth-field__label">Last name</span>
                    <input
                      className={inputClass("lastName")}
                      placeholder="Okafor"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); clearError("lastName"); }}
                    />
                    {errors.lastName && <p className="auth-error">{errors.lastName}</p>}
                  </label>
                </div>

                <label className="auth-field">
                  <span className="auth-field__label">Email address</span>
                  <input
                    type="email"
                    className={inputClass("email")}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                    autoComplete="email"
                  />
                  {errors.email && <p className="auth-error">{errors.email}</p>}
                </label>

                <label className="auth-field">
                  <span className="auth-field__label">Password</span>
                  <div className="auth-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${inputClass("password")} auth-input--pad`}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className="auth-error">{errors.password}</p>}
                </label>

                <button className="auth-btn auth-btn--yellow" disabled={isLoading}>
                  {isLoading ? "Registering…" : "Register"}
                </button>

                <p className="auth-foot">
                  Already have an account? <Link to="/login" className="auth-foot__link">Log in</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
