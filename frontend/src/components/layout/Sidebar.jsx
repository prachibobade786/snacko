import React from "react";
import useAppServices from "../../hooks/useAppServices";

export default function Footer() {
  const { setMode } = useAppServices();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-8 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-slate-100 font-extrabold logo-text text-sm">Snacko.</span>
          <p className="mt-1 text-[11px] text-slate-500">© 2026 Snacko Technologies Pvt. Ltd. All rights reserved.</p>
        </div>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
          <span className="hover:text-white cursor-pointer">Support</span>
          <span 
            onClick={() => setMode("partner-login")}
            className="hover:text-white cursor-pointer font-bold"
            style={{ color: "var(--primary-color)" }}
          >
            Partner Portal
          </span>
        </div>
      </div>
    </footer>
  );
}
