import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, User, Phone, Key, AlertCircle, CheckCircle } from "lucide-react";
import logoImg from "../../assets/snackologo.png";
import useAppServices from "../../hooks/useAppServices";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loginError,
    handleLogin,
    autoLoginAs,
    setMode,
    handleRegister,
    handleForgotPassword,
    handleResetPassword
  } = useAppServices();

  // Screen selector: 'signin' | 'signup' | 'forgot'
  const [authScreen, setAuthScreen] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up local inputs
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  // Forgot Password local inputs
  const [resetEmail, setResetEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: send code, 2: reset password
  const [demoCode, setDemoCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form handlers
  const onSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");
    const res = await handleRegister(signupName, signupEmail, signupPassword, signupMobile);
    if (!res.success) {
      setSignupError(res.message || "Registration failed. Try again.");
    }
  };

  const onForgotSendCode = async (e) => {
    e.preventDefault();
    setResetError("");
    setSuccessMsg("");
    const res = await handleForgotPassword(resetEmail);
    if (res.success) {
      setDemoCode(res.code);
      setForgotStep(2);
      setSuccessMsg("Verification code sent to your email address!");
    } else {
      setResetError(res.message || "Failed to generate code.");
    }
  };

  const onResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setSuccessMsg("");
    const res = await handleResetPassword(resetEmail, otpCode, newPassword);
    if (res.success) {
      setAuthScreen("signin");
      setEmail(resetEmail);
      setPassword("");
      setForgotStep(1);
      setResetEmail("");
      setOtpCode("");
      setNewPassword("");
    } else {
      setResetError(res.message || "Password reset failed. Invalid code.");
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3"
      style={{ backgroundColor: "#f8fafc", fontFamily: "var(--font-family, sans-serif)" }}
    >
      <div 
        className="card border-0 shadow-lg overflow-hidden w-full"
        style={{ maxWidth: "900px", borderRadius: "24px" }}
      >
        <div className="row g-0">
          
          {/* Left Column: Brand Marketing Banner (Desktop only) */}
          <div 
            className="col-md-6 d-none d-md-flex flex-column justify-content-between p-5 text-white position-relative"
            style={{ 
              background: "linear-gradient(135deg, #ff9f1c 0%, #ff6500 100%)",
              minHeight: "560px" 
            }}
          >
            {/* Background decorative circles */}
            <div 
              className="position-absolute rounded-circle"
              style={{
                width: "200px",
                height: "200px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                top: "-50px",
                left: "-50px"
              }}
            ></div>
            <div 
              className="position-absolute rounded-circle"
              style={{
                width: "150px",
                height: "150px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                bottom: "-30px",
                right: "-30px"
              }}
            ></div>

            {/* Back to store navigation */}
            <button 
              onClick={() => setMode("customer")}
              className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0 opacity-75 hover-opacity-100 z-1"
              style={{ width: "fit-content" }}
            >
              <ArrowLeft size={16} />
              <span>Back to Storefront</span>
            </button>

            {/* Core branding pitch */}
            <div className="my-auto z-1">
              <div className="bg-white p-2 rounded-3 d-inline-block mb-4 shadow-sm" style={{ width: "fit-content" }}>
                <img src={logoImg} alt="Snacko Logo" style={{ height: "40px" }} />
              </div>
              <h2 className="display-6 fw-bold mb-3" style={{ letterSpacing: "-0.5px" }}>
                Craving Satisfied in 15 Minutes!
              </h2>
              <p className="lead opacity-90 fs-6 mb-4">
                Experience lightning-fast delivery of your favorite snacks, drinks, and daily groceries right from our closest dark store.
              </p>
              
              <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                <li className="d-flex align-items-center gap-2">
                  <span className="badge bg-white text-orange rounded-circle p-1" style={{ color: "#ff6500" }}>✓</span>
                  <span>Hyperlocal delivery mapping</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className="badge bg-white text-orange rounded-circle p-1" style={{ color: "#ff6500" }}>✓</span>
                  <span>Live warehouse inventory syncing</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className="badge bg-white text-orange rounded-circle p-1" style={{ color: "#ff6500" }}>✓</span>
                  <span>Dedicated customer and admin portals</span>
                </li>
              </ul>
            </div>

            <div className="z-1 opacity-75 small">
              &copy; 2026 Snacko. Pure snacking bliss.
            </div>
          </div>

          {/* Right Column: Form area (dynamically renders screens) */}
          <div className="col-md-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
            
            {/* Mobile navigation and Logo */}
            <div className="d-flex justify-content-between align-items-center d-md-none mb-4">
              <img src={logoImg} alt="Snacko Logo" style={{ height: "35px" }} />
              <button 
                onClick={() => setMode("customer")}
                className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1"
              >
                <ArrowLeft size={14} />
                <span>Store</span>
              </button>
            </div>

            {/* SCREEN 1: SIGN IN */}
            {authScreen === "signin" && (
              <>
                <div className="mb-4 text-center text-md-start">
                  <h3 className="fw-bold text-dark mb-1">Welcome back!</h3>
                  <p className="text-secondary small">Please enter your credentials to login</p>
                </div>

                {loginError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small border-0" role="alert" style={{ backgroundColor: "#fff1f2", color: "#9f1239" }}>
                    <AlertCircle size={16} />
                    <div className="fw-semibold">{loginError}</div>
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="input-group mb-3" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <span className="input-group-text bg-white border-0 text-secondary pe-0">
                      <Mail size={18} />
                    </span>
                    <input 
                      type="email" 
                      className="form-control border-0 py-3" 
                      placeholder="Email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ outline: "none", boxShadow: "none" }}
                    />
                  </div>

                  <div className="input-group mb-3" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <span className="input-group-text bg-white border-0 text-secondary pe-0">
                      <Lock size={18} />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control border-0 py-3" 
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ outline: "none", boxShadow: "none" }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn bg-white border-0 text-secondary"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4 small">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" style={{ accentColor: "#ff6500" }} />
                      <label className="form-check-label text-secondary" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setAuthScreen("forgot"); setResetError(""); setSuccessMsg(""); }}
                      className="btn btn-link p-0 text-decoration-none fw-bold small text-orange" 
                      style={{ color: "#ff6500", border: "none", background: "none", boxShadow: "none" }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 text-white fw-bold shadow-sm mb-4"
                  >
                    Sign In
                  </button>
                </form>



                <div className="text-center small text-secondary">
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => { setAuthScreen("signup"); setSignupError(""); }}
                    className="btn btn-link p-0 fw-bold text-decoration-none" 
                    style={{ color: "#ff6500", border: "none", background: "none", boxShadow: "none" }}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}

            {/* SCREEN 2: SIGN UP */}
            {authScreen === "signup" && (
              <>
                <div className="mb-4 text-center text-md-start">
                  <h3 className="fw-bold text-dark mb-1">Create an Account</h3>
                  <p className="text-secondary small">Join Snacko today for instant grocery deliveries</p>
                </div>

                {signupError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small border-0" role="alert" style={{ backgroundColor: "#fff1f2", color: "#9f1239" }}>
                    <AlertCircle size={16} />
                    <div className="fw-semibold">{signupError}</div>
                  </div>
                )}

                <form onSubmit={onSignupSubmit}>
                  {/* Name field */}
                  <div className="input-group mb-3" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <span className="input-group-text bg-white border-0 text-secondary pe-0">
                      <User size={18} />
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-0 py-3" 
                      placeholder="Full Name"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      style={{ outline: "none", boxShadow: "none" }}
                    />
                  </div>

                  {/* Email field */}
                  <div className="input-group mb-3" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <span className="input-group-text bg-white border-0 text-secondary pe-0">
                      <Mail size={18} />
                    </span>
                    <input 
                      type="email" 
                      className="form-control border-0 py-3" 
                      placeholder="Email address"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      style={{ outline: "none", boxShadow: "none" }}
                    />
                  </div>

                  {/* Mobile field */}
                  <div className="input-group mb-3" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <span className="input-group-text bg-white border-0 text-secondary pe-0">
                      <Phone size={18} />
                    </span>
                    <input 
                      type="tel" 
                      className="form-control border-0 py-3" 
                      placeholder="Mobile Number"
                      required
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      style={{ outline: "none", boxShadow: "none" }}
                    />
                  </div>

                  {/* Password field */}
                  <div className="input-group mb-4" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    <span className="input-group-text bg-white border-0 text-secondary pe-0">
                      <Lock size={18} />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control border-0 py-3" 
                      placeholder="Password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      style={{ outline: "none", boxShadow: "none" }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn bg-white border-0 text-secondary"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 text-white fw-bold shadow-sm mb-4"
                  >
                    Sign Up
                  </button>
                </form>

                <div className="text-center small text-secondary">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => { setAuthScreen("signin"); }}
                    className="btn btn-link p-0 fw-bold text-decoration-none" 
                    style={{ color: "#ff6500", border: "none", background: "none", boxShadow: "none" }}
                  >
                    Sign In
                  </button>
                </div>
              </>
            )}

            {/* SCREEN 3: FORGOT PASSWORD */}
            {authScreen === "forgot" && (
              <>
                <div className="mb-4 text-center text-md-start">
                  <h3 className="fw-bold text-dark mb-1">Reset Password</h3>
                  <p className="text-secondary small">
                    {forgotStep === 1 
                      ? "Enter your email to receive a demo verification code" 
                      : "Enter verification code and your new password"}
                  </p>
                </div>

                {resetError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small border-0" role="alert" style={{ backgroundColor: "#fff1f2", color: "#9f1239" }}>
                    <AlertCircle size={16} />
                    <div className="fw-semibold">{resetError}</div>
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small border-0" role="alert" style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}>
                    <CheckCircle size={16} />
                    <div className="fw-semibold">{successMsg}</div>
                  </div>
                )}

                {forgotStep === 1 ? (
                  // FORGOT PASSWORD - STEP 1 (Send Code)
                  <form onSubmit={onForgotSendCode}>
                    <div className="input-group mb-4" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                      <span className="input-group-text bg-white border-0 text-secondary pe-0">
                        <Mail size={18} />
                      </span>
                      <input 
                        type="email" 
                        className="form-control border-0 py-3" 
                        placeholder="Email address"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        style={{ outline: "none", boxShadow: "none" }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-3 text-white fw-bold shadow-sm mb-4"
                    >
                      Send Reset Code
                    </button>
                  </form>
                ) : (
                  // FORGOT PASSWORD - STEP 2 (Reset Password)
                  <form onSubmit={onResetSubmit}>
                    {/* Email Display */}
                    <div className="input-group mb-3" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", backgroundColor: "#f8fafc" }}>
                      <span className="input-group-text bg-transparent border-0 text-secondary pe-0">
                        <Mail size={18} />
                      </span>
                      <input 
                        type="email" 
                        className="form-control border-0 py-3 bg-transparent text-secondary" 
                        disabled
                        value={resetEmail}
                      />
                    </div>

                    {/* Reset Code input */}
                    <div className="input-group mb-3" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                      <span className="input-group-text bg-white border-0 text-secondary pe-0">
                        <Key size={18} />
                      </span>
                      <input 
                        type="text" 
                        className="form-control border-0 py-3" 
                        placeholder="Reset Code (E.g. 123456)"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        style={{ outline: "none", boxShadow: "none" }}
                      />
                    </div>

                    {/* New Password input */}
                    <div className="input-group mb-4" style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                      <span className="input-group-text bg-white border-0 text-secondary pe-0">
                        <Lock size={18} />
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control border-0 py-3" 
                        placeholder="New Password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ outline: "none", boxShadow: "none" }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn bg-white border-0 text-secondary"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-3 text-white fw-bold shadow-sm mb-4"
                    >
                      Reset Password
                    </button>
                  </form>
                )}

                <div className="text-center small text-secondary">
                  Go back to{" "}
                  <button 
                    type="button"
                    onClick={() => { setAuthScreen("signin"); setForgotStep(1); setResetEmail(""); setOtpCode(""); setNewPassword(""); }}
                    className="btn btn-link p-0 fw-bold text-decoration-none" 
                    style={{ color: "#ff6500", border: "none", background: "none", boxShadow: "none" }}
                  >
                    Sign In
                  </button>
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
