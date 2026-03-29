import React, { useState, useRef, useEffect } from "react";
import "./AdminAuthModal.css";

/** SHA-256 hash via Web Crypto API — works in all modern browsers */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminAuthModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Check if hash is configured
  const storedHash = import.meta.env.VITE_ADMIN_HASH;
  const notConfigured = !storedHash || storedHash.trim() === "";

  useEffect(() => {
    // Focus input when modal opens
    setTimeout(() => inputRef.current?.focus(), 120);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (notConfigured || !password || loading) return;

    setLoading(true);
    setError("");

    try {
      const inputHash = await sha256(password);
      if (inputHash === storedHash.trim()) {
        onSuccess();
      } else {
        setError("Incorrect password.");
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`auth-modal ${shaking ? "shake" : ""}`}>
        {/* Decorative glow ring */}
        <div className="auth-glow" />

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon">⬡</div>
          <h2 className="auth-title">Admin Access</h2>
          <p className="auth-subtitle">
            {notConfigured
              ? "Password not configured yet."
              : "Enter the admin password to continue."}
          </p>
        </div>

        {notConfigured ? (
          /* Setup instructions */
          <div className="auth-setup">
            <p>Run this command in your terminal to set a password:</p>
            <code>node scripts/gen-hash.mjs &lt;your-password&gt;</code>
            <p>Then paste the hash into <strong>.env.local</strong> and restart the dev server.</p>
          </div>
        ) : (
          /* Password form */
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <input
                ref={inputRef}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Password"
                className={`auth-input ${error ? "error" : ""}`}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPw ? "◉" : "◎"}
              </button>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className={`auth-submit ${loading ? "loading" : ""}`}
              disabled={!password || loading}
            >
              {loading ? <span className="auth-spinner" /> : "Authenticate"}
            </button>
          </form>
        )}

        {/* Close */}
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  );
}
