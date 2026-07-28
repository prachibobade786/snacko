import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logoImg from "../../assets/snackologo.png";
import "./LoginModal.css";

export default function LoginModal({
  isOpen,
  onClose,
  email,
  setEmail,
  password,
  setPassword,
  loginError,
  handleLogin,
  autoLoginAs
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="login-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Curves Decoration */}
        <div className="login-modal-decor-1"></div>
        <div className="login-modal-decor-2"></div>

        {/* Close button */}
        <button onClick={onClose} className="login-close-btn">
          ✕
        </button>

        {/* Centered Logo */}
        <img src={logoImg} alt="Snacko Logo" className="login-logo" />
        
        <h3 className="login-title">Welcome back!</h3>
        <p className="login-subtitle">Login to continue your snacking journey</p>

        {loginError && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-2.5 text-xs font-semibold mb-4 text-center z-10">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          {/* Email field */}
          <div className="login-input-group">
            <Mail className="login-input-icon" size={18} />
            <input 
              type="email" 
              required
              className="login-input-field"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password field */}
          <div className="login-input-group">
            <Lock className="login-input-icon" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              required
              className="login-input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="login-eye-btn"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember & Forgot options */}
          <div className="login-options-row">
            <label className="login-remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <span className="login-forgot-pass">Forgot password?</span>
          </div>

          <button type="submit" className="login-submit-btn">
            Login
          </button>
        </form>



        <p className="login-footer-text">
          Don't have an account? <span>Sign up</span>
        </p>
      </div>
    </div>
  );
}
