import React from "react";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessModal({ isOpen, onClose, warehouse }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop z-50">
      <div className="modal-content max-w-sm text-center">
        <CheckCircle size={56} className="text-emerald-600 mx-auto mb-4 animate-bounce" />
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Order Placed!</h3>
        <p className="text-slate-600 text-sm mb-6">
          Your delivery is being prepared at <strong className="text-slate-800">{warehouse?.name || "nearest dark store"}</strong> and will arrive shortly!
        </p>
        <button 
          onClick={onClose}
          className="btn btn-primary px-8 rounded-xl"
        >
          Great, thanks!
        </button>
      </div>
    </div>
  );
}
