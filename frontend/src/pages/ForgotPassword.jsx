import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import logo from "../assets/logo.png";
import food7 from "../assets/food7.webp";

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); 
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Enter your email address."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/otp/forgot-password", { email });
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError("Enter the code we sent you."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/otp/reset-password", { email, code, newPassword });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    try {
      await api.post("/otp/forgot-password", { email });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

  return (
    <div className="auth-shell" style={{ minHeight: "92vh" }}>
      <aside className="auth-art">
        <div className="auth-art__blob" aria-hidden="true" />
        <img src={food7} alt="" className="food7" />
        <div className="auth-art__copy">
          <p className="auth-art__eyebrow">Forgot something?</p>
          <h2 className="auth-art__title">Let's get you<br />back in.</h2>
        </div>
      </aside>

      <main className="login">
        <div className="login2">
          <Link to="/" className="auth-brand">
            <img src={logo} alt="Recipia" className="auth-brand__logo" />
            <span className="auth-brand__word">ecipia</span>
          </Link>

          {step === "email" && (
            <>
              <h1 className="auth-heading">Reset your password</h1>
              <p className="auth-sub">Enter your email and we'll send you a code to reset it.</p>

              <form onSubmit={requestCode} className="auth-form" noValidate>
                {error && <p className="auth-alert">{error}</p>}
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
                <button className="auth-btn auth-btn--yellow" disabled={loading}>
                  {loading ? "Sending…" : "Send reset code"}
                </button>
                <p className="auth-foot">
                  Remembered it? <Link to="/login" className="auth-foot__link">Log in</Link>
                </p>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="auth-heading">Check your email</h1>
              <p className="auth-sub">
                We sent a code to <strong>{email}</strong>. Enter it below with your new password.
              </p>

              <form onSubmit={resetPassword} className="auth-form" noValidate>
                {error && <p className="auth-alert">{error}</p>}

                <div className="auth-otp">
                  <p className="auth-otp__hint">Verification code</p>
                  <input
                    className="auth-otp__input"
                    inputMode="numeric"
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                  />
                </div>

                <label className="auth-field">
                  <span className="auth-field__label">New password</span>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-field__label">Confirm new password</span>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                <button className="auth-btn auth-btn--yellow" disabled={loading}>
                  {loading ? "Resetting…" : "Reset password"}
                </button>

                <button type="button" className="auth-link-btn" onClick={resend}>
                  Resend code
                </button>
                <button type="button" className="auth-link-btn" onClick={() => setStep("email")}>
                  ← Use a different email
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <>
              <h1 className="auth-heading">Password reset!</h1>
              <p className="auth-sub">You can now log in with your new password.</p>
              <button onClick={() => navigate("/login")} className="auth-btn auth-btn--yellow">
                Go to log in
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}