import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import food7 from "../assets/food7.png";
import logo from "../assets/logo.png";
import ForgotPassword from "./ForgotPassword.jsx";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const verify = async () => {
    if (!otpCode.trim()) { setOtpError("empty"); return; }
    setVerifying(true);
    setOtpError("");
    try {
      const res = await api.post("/otp/verify", { email, code: otpCode });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch {
      setOtpError("wrong");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setResendSent(false);
    if (!email || !password) { setError("Please fill in both fields"); return; }

    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      login(res.data.user, res.data.token);
      navigate(res.data.user?.roles?.includes("admin") ? "/admin-dashboard" : "/dashboard");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 403 && msg?.toLowerCase().includes("verify")) {
        setUnverified(true);
        setError(msg);
      } else {
        setError(msg || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      await api.post("/otp/resend", { email });
      setResendSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code");
    }
  };

  return (
    <div className="auth-shell" style={{ minHeight: "92vh" }}>

      <aside className="auth-art">
        <div className="auth-art__blob" aria-hidden="true" />
        <img src={food7} alt="" className="food7" />

        <div className="auth-art__copy">
          <p className="auth-art__eyebrow">Welcome back</p>
          <h2 className="auth-art__title">Good food<br />starts here.</h2>
        </div>
      </aside>

      
      <main className="login">
        <div className="login2">
          <Link to="/" className="auth-brand">
            <img src={logo} alt="Recipia" className="auth-brand__logo" />
            <span className="auth-brand__word">ecipia</span>
          </Link>

          <h1 className="auth-heading">Log in to your kitchen</h1>
          <p className="auth-sub">Discover, cook, and share amazing recipes.</p>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && <p className="auth-alert">{error}</p>}

            {unverified && !resendSent && (
              <button type="button" onClick={resendVerification} className="auth-link-btn">
                Resend verification code
              </button>
            )}

            {resendSent && (
              <div className="auth-otp">
                <p className="auth-otp__hint">Enter the code we just sent to your email</p>
                <input
                  className="auth-otp__input"
                  inputMode="numeric"
                  maxLength={5}
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                />
                {otpError && (
                  <p className="auth-error">
                    {otpError === "empty" ? "Please enter the code." : "Wrong code. Please try again."}
                  </p>
                )}
                <button type="button" onClick={verify} className="auth-btn auth-btn--olive" disabled={verifying}>
                  {verifying ? "Verifying…" : "Verify"}
                </button>
              </div>
            )}

            <label className="auth-field">
              <span className="auth-field__label">Email address</span>
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Password</span>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input auth-input--pad"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </label>

            <button className="auth-btn auth-btn--yellow" disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </button>

            <p className="auth-foot">
              Don’t have an account? <Link to="/register" className="auth-foot__link">Sign up</Link>
            </p>

     <div style={{ textAlign: "right" }}>
  <Link to="/forgot-password" className="auth-link-btn">Forgot password?</Link>
</div>
          </form>
        </div>
      </main>
    </div>
  );
}
