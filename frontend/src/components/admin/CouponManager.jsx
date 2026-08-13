import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Ticket, ToggleLeft, ToggleRight, Loader2, Calendar, X } from "lucide-react";
import * as api from "../../api/api";

export default function CouponManager({ token }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Coupon Form States
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.fetchCoupons(token);
      if (res.success) {
        setCoupons(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCoupons();
    }
  }, [token]);

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!code || !discountValue) return;

    setSubmitting(true);
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_amount: parseFloat(minOrderAmount || 0),
        expiry_date: expiryDate ? `${expiryDate}T23:59:59` : null
      };

      let res;
      if (editingId) {
        res = await api.updateCoupon(token, editingId, payload);
      } else {
        res = await api.createCoupon(token, payload);
      }

      if (res.success) {
        setSuccess(editingId ? "Coupon updated successfully!" : "Coupon code created successfully!");
        setEditingId(null);
        setCode("");
        setDiscountValue("");
        setMinOrderAmount("");
        setExpiryDate("");
        loadCoupons();
      } else {
        setError(res.message || "Failed to save coupon.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection to server failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (coupon) => {
    setError("");
    setSuccess("");
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value);
    setMinOrderAmount(coupon.min_order_amount);
    
    if (coupon.expiry_date) {
      const date = new Date(coupon.expiry_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setExpiryDate(`${year}-${month}-${day}`);
    } else {
      setExpiryDate("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrderAmount("");
    setExpiryDate("");
    setError("");
    setSuccess("");
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = coupon.is_active === 1 ? 0 : 1;
      const res = await api.updateCoupon(token, coupon.id, { is_active: newStatus });
      if (res.success) {
        loadCoupons();
      } else {
        alert(res.message || "Failed to update coupon status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to permanently delete this coupon?")) return;
    try {
      const res = await api.deleteCoupon(token, couponId);
      if (res.success) {
        if (editingId === couponId) {
          handleCancelEdit();
        }
        loadCoupons();
      } else {
        alert(res.message || "Failed to delete coupon.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="fade-in d-flex flex-column gap-4">
      {/* Create/Edit Coupon Card */}
      <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h4 className="fw-extrabold text-dark mb-0">
            {editingId ? "Edit Promo Coupon" : "Create Promo Coupon"}
          </h4>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 py-1 px-3 text-xxs font-bold"
            >
              <X size={12} />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>
        <p className="text-muted text-xs mb-4">
          {editingId ? "Modify parameters for this promo coupon" : "Generate checkout coupons and define their eligibility & expiry"}
        </p>
        
        {error && <div className="alert alert-danger py-2 text-xs font-semibold">{error}</div>}
        {success && <div className="alert alert-success py-2 text-xs font-semibold">{success}</div>}

        <form onSubmit={handleSubmitCoupon} className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold">Coupon Code *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. SNACK10"
              className="form-control py-2 text-xs font-semibold text-uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-bold">Discount Type *</label>
            <select
              className="form-select py-2 text-xs font-semibold"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Flat (₹)</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-bold">Discount Value *</label>
            <input 
              type="number" 
              required
              min="0.01"
              step="0.01"
              placeholder={discountType === "percentage" ? "10%" : "₹50"}
              className="form-control py-2 text-xs font-semibold"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-bold">Min Order Value</label>
            <input 
              type="number" 
              min="0"
              placeholder="₹0.00"
              className="form-control py-2 text-xs font-semibold"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small fw-bold">Expiry Date</label>
            <input 
              type="date" 
              className="form-control py-2 text-xs font-semibold text-muted"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <div className="col-12 mt-3">
            <button 
              type="submit" 
              disabled={submitting}
              className="btn btn-warning w-100 rounded-3 text-xs font-bold text-white py-2.5 shadow-sm d-flex align-items-center justify-content-center gap-1.5"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
              <span>{editingId ? "Save Coupon Changes" : "Create Coupon Code"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Coupons List Table */}
      <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
        <h4 className="fw-extrabold text-dark mb-1">Active Store Promo Coupons</h4>
        <p className="text-muted text-xs mb-4">View and control status of generated promo coupons</p>
        
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="animate-spin text-warning mx-auto mb-2" size={24} />
            <p className="text-xs text-muted font-bold">Fetching coupons...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted font-bold">
                  <th className="py-3 px-3">Coupon Code</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Discount</th>
                  <th className="py-3">Min Order</th>
                  <th className="py-3">Expiry Date</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-end px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {coupons.map(coupon => {
                  const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
                  const isCurrentlyEditing = editingId === coupon.id;
                  return (
                    <tr key={coupon.id} className={`${isExpired ? "opacity-60" : ""} ${isCurrentlyEditing ? "table-warning bg-opacity-10" : ""}`}>
                      <td className="px-3">
                        <div className="d-flex align-items-center gap-2">
                          <Ticket size={16} className="text-warning" />
                          <span className="fw-bold text-dark">{coupon.code}</span>
                          {isExpired && (
                            <span className="badge bg-danger bg-opacity-10 text-danger text-xxs rounded-pill">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-capitalize text-muted">{coupon.discount_type}</td>
                      <td className="fw-bold text-dark">
                        {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                      </td>
                      <td className="text-muted">₹{coupon.min_order_amount}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5 text-muted">
                          <Calendar size={12} />
                          <span>{formatDate(coupon.expiry_date)}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className="btn btn-sm border-0 p-0 text-muted"
                          title="Toggle active status"
                        >
                          {coupon.is_active === 1 ? (
                            <ToggleRight className="text-success" size={24} />
                          ) : (
                            <ToggleLeft className="text-slate-300" size={24} />
                          )}
                        </button>
                      </td>
                      <td className="text-end px-3">
                        <div className="d-flex justify-content-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(coupon)}
                            className="btn btn-sm border-0 p-1 text-slate-400 hover:text-warning rounded-3"
                            title="Edit coupon"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="btn btn-sm border-0 p-1 text-slate-400 hover:text-danger rounded-3"
                            title="Delete coupon permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">No promo coupons created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
