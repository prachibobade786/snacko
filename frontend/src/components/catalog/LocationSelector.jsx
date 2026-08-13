import React from "react";
import { Compass, AlertTriangle, MapPin } from "lucide-react";

export default function LocationSelector({
  pincode,
  pincodeInput,
  setPincodeInput,
  serviceable,
  handlePincodeSubmit,
  detectGeoLocation
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    handlePincodeSubmit(e);
  };

  return (
    <section className="hero animate-fade-in">
      <div className="hero-inner">
        <div className="hero-text">
          <span className="eyebrow">Delivered in 10 minutes</span>
          <h1>Crave it. <span>Get it.</span></h1>
          <p>Chips, cola, chocolate or midnight snacks — Snacko gets your cravings to your door before the couch gets comfortable.</p>
          
          <form className="hero-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Enter your delivery pincode (e.g. 122003)" 
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
            />
            <button type="submit">Find snacks</button>
          </form>

          <button 
            type="button" 
            onClick={detectGeoLocation}
            className="btn btn-secondary flex items-center justify-center gap-2 mt-4 text-xs !py-2 !px-4"
            style={{ borderRadius: "10px", width: "fit-content" }}
          >
            <Compass size={14} />
            <span>Use Current Location</span>
          </button>

          {serviceable === false && (
            <div className="flex items-center gap-2 mt-4 bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200">
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                Apologies! Pincode <strong>{pincode}</strong> is unserviceable. Try test pincodes like <strong>122003</strong> or <strong>110001</strong>.
              </span>
            </div>
          )}

          {!pincode && (
            <div className="flex items-center gap-1.5 mt-4 text-[11px] text-[#DDC9B8]">
              <MapPin size={12} className="text-orange-500" />
              <span>Please select your location/pincode to view local stock.</span>
            </div>
          )}

          <div className="hero-stats">
            <div><strong>10 min</strong>avg delivery</div>
            <div><strong>2,400+</strong>snacks &amp; drinks</div>
            <div><strong>150+</strong>cities</div>
          </div>
        </div>

        <div className="hero-visual">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of an open Snacko delivery box with a chips packet and a bottle">
            <ellipse cx="100" cy="176" rx="60" ry="10" fill="#000000" opacity="0.15"/>
            <path d="M40 90L100 68L160 90L100 112L40 90Z" fill="#F5811F"/>
            <path d="M40 90V150L100 172V112L40 90Z" fill="#D8690F"/>
            <path d="M160 90V150L100 172V112L160 90Z" fill="#F5811F"/>
            <path d="M62 100C68 108 132 108 138 100" stroke="#FDF8F3" stroke-width="4" stroke-linecap="round"/>
            <rect x="72" y="30" width="30" height="46" rx="6" transform="rotate(-8 72 30)" fill="#E8A33D"/>
            <rect x="72" y="30" width="30" height="46" rx="6" transform="rotate(-8 72 30)" fill="#F0B85B" opacity="0.5"/>
            <rect x="108" y="20" width="20" height="52" rx="8" fill="#D85A30"/>
            <rect x="112" y="14" width="12" height="10" rx="2" fill="#8A2E14"/>
            <circle cx="34" cy="52" r="4" fill="#7CB342"/>
            <circle cx="168" cy="58" r="4" fill="#7CB342"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
