import React from "react";
import useAppServices from "../../hooks/useAppServices";
import logoImg from "../../assets/snackologo.png";

export default function Footer() {
  const { setMode } = useAppServices();

  return (
    <footer className="storefront-footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-mark" style={{ height: "34px", display: "flex", alignItems: "center" }}>
              <img src={logoImg} alt="Snacko" style={{ height: "34px", objectFit: "contain", width: "auto" }} />
            </div>
            <p>Your cravings, delivered in minutes. Chips, drinks, sweets and everything in between.</p>
          </div>
          
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><span>About us</span></li>
              <li><span>Careers</span></li>
              <li><span>Blog</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><span>Help centre</span></li>
              <li><span>Track order</span></li>
              <li>
                <span 
                  onClick={() => setMode("partner-login")}
                  className="font-bold"
                  style={{ color: "var(--orange)" }}
                >
                  Partner Portal
                </span>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><span>Terms of service</span></li>
              <li><span>Privacy policy</span></li>
              <li><span>Refund policy</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 Snacko. All rights reserved.</span>
          <span>Made for late-night cravings.</span>
        </div>
      </div>
    </footer>
  );
}
