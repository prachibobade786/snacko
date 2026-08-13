import React from "react";
import { MapPin, Compass, AlertTriangle } from "lucide-react";

export default function LocationSelector({
  pincode,
  pincodeInput,
  setPincodeInput,
  serviceable,
  handlePincodeSubmit,
  detectGeoLocation
}) {
  if (!pincode) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8 shadow-sm">
        <MapPin size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Select Your Delivery Location</h2>
        <p className="text-slate-600 text-sm mb-4">
          Please enter your pincode to see the grocery stock and products available in your nearest Blinkit warehouse.
        </p>
        <div className="flex flex-col gap-2 max-w-sm mx-auto">
          <form onSubmit={handlePincodeSubmit} className="flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="E.g. 122003 or 110017" 
              className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-emerald-500"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Check</button>
          </form>
          <button 
            type="button" 
            onClick={detectGeoLocation}
            className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-1"
          >
            <Compass size={16} />
            Use Current Location
          </button>
        </div>
      </div>
    );
  }

  if (serviceable === false) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8 shadow-sm">
        <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Unserviceable Area</h2>
        <p className="text-slate-600 text-sm mb-4">
          Apologies! We do not currently service pincode <strong>{pincode}</strong>.
          Try entering test pincodes like <strong>122003</strong> or <strong>110001</strong>.
        </p>
        <div className="flex flex-col gap-2 max-w-sm mx-auto">
          <form onSubmit={handlePincodeSubmit} className="flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="E.g. 122003" 
              className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-emerald-500"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Try Again</button>
          </form>
          <button 
            type="button" 
            onClick={detectGeoLocation}
            className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-1"
          >
            <Compass size={16} />
            Detect My Location
          </button>
        </div>
      </div>
    );
  }

  return null;
}
