import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Building, AlertCircle } from "lucide-react";
import logoImg from "../../assets/snackologo.png";
import useAppServices from "../../hooks/useAppServices";

export default function PartnerLoginPage() {
  const {
    loginError,
    setLoginError,
    loginDirectly,
    setMode
  } = useAppServices();

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailInput.trim() && passwordInput) {
      await loginDirectly(emailInput.trim(), passwordInput);
    }
  };


  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3"
      style={{ backgroundColor: "#0f172a", fontFamily: "var(--font-family, sans-serif)" }}
    >
      <style>{`
        .partner-login-input::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 1 !important;
        }
      `}</style>
      <div 
        className="card border-0 shadow-lg overflow-hidden w-full"
        style={{ maxWidth: "900px", borderRadius: "24px", backgroundColor: "#1e293b" }}
      >
        <div className="row g-0">
          
          {/* Left Column: Brand Marketing Banner */}
          <div 
            className="col-md-6 d-none d-md-flex flex-column justify-content-between p-5 text-white position-relative"
            style={{ 
              background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
              minHeight: "560px",
              borderRight: "1px solid rgba(255,255,255,0.05)"
            }}
          >
            {/* Background decorative elements */}
            <div 
              className="position-absolute rounded-circle"
              style={{
                width: "200px",
                height: "200px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                top: "-50px",
                left: "-50px"
              }}
            ></div>
            <div 
              className="position-absolute rounded-circle"
              style={{
                width: "150px",
                height: "150px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                bottom: "-30px",
                right: "-30px"
              }}
            ></div>

            {/* Back to storefront */}
            <button 
              onClick={() => { setLoginError(""); setMode("customer"); }}
              className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0 opacity-75 hover-opacity-100 z-1 text-xs"
              style={{ width: "fit-content" }}
            >
              <ArrowLeft size={14} />
              <span>Back to Storefront</span>
            </button>

            {/* Core branding pitch */}
            <div className="my-auto z-1">
              <div className="bg-white p-2 rounded-3 d-inline-block mb-4 shadow-sm" style={{ width: "fit-content" }}>
                <img src={logoImg} alt="Snacko Logo" style={{ height: "35px" }} />
              </div>
              <h2 className="display-6 fw-bold mb-3 text-white" style={{ letterSpacing: "-0.5px", fontSize: "1.75rem" }}>
                Snacko Partner Network
              </h2>
              <p className="lead opacity-75 fs-6 mb-4 text-slate-300">
                Log in to fulfill instant customer orders, manage localized warehouse inventories, or control system configuration.
              </p>
              
              <ul className="list-unstyled d-flex flex-column gap-3 mb-0 text-slate-300 small">
                <li className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning bg-opacity-20 text-warning rounded-circle p-1">✓</span>
                  <span>Interactive Packing & Dispatch desks</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning bg-opacity-20 text-warning rounded-circle p-1">✓</span>
                  <span>Real-time dark store stock controls</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning bg-opacity-20 text-warning rounded-circle p-1">✓</span>
                  <span>Administrative user & warehouse panel</span>
                </li>
              </ul>
            </div>

            <div className="z-1 opacity-50 small text-slate-400">
              &copy; 2026 Snacko. Partner Portal.
            </div>
          </div>

          {/* Right Column: Form Area */}
          <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center" style={{ backgroundColor: "#1e293b" }}>
            
            {/* Mobile Navigation */}
            <div className="d-flex justify-content-between align-items-center d-md-none mb-4">
              <img src={logoImg} alt="Snacko Logo" style={{ height: "30px" }} />
              <button 
                onClick={() => { setLoginError(""); setMode("customer"); }}
                className="btn btn-sm btn-outline-light rounded-pill d-flex align-items-center gap-1 text-xs"
              >
                <ArrowLeft size={12} />
                <span>Store</span>
              </button>
            </div>

            <div className="mb-4 text-center text-md-start">
              <h3 className="fw-bold text-white mb-1">Partner Sign In</h3>
              <p className="text-slate-400 small">Access admin console or dark store fulfillment desk</p>
            </div>

            {loginError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small border-0" role="alert" style={{ backgroundColor: "#451a25", color: "#fecdd3" }}>
                <AlertCircle size={16} />
                <div className="fw-semibold">{loginError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="input-group mb-3" style={{ border: "1.5px solid #475569", borderRadius: "12px", overflow: "hidden", backgroundColor: "#0f172a" }}>
                <span className="input-group-text bg-transparent border-0 text-slate-400 pe-0">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  className="form-control border-0 py-3 bg-transparent text-white partner-login-input" 
                  placeholder="Partner Email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ outline: "none", boxShadow: "none" }}
                />
              </div>

              {/* Password */}
              <div className="input-group mb-3" style={{ border: "1.5px solid #475569", borderRadius: "12px", overflow: "hidden", backgroundColor: "#0f172a" }}>
                <span className="input-group-text bg-transparent border-0 text-slate-400 pe-0">
                  <Lock size={18} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control border-0 py-3 bg-transparent text-white partner-login-input" 
                  placeholder="Password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{ outline: "none", boxShadow: "none" }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn bg-transparent border-0 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Select Destination Portal */}

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 text-white fw-bold shadow-sm mb-4"
              >
                Sign In to Portal
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
