import React, { useEffect, useState } from "react";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Calendar, 
  Percent, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { 
  fetchCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon 
} from "../../api/api";

export default function CouponManager({ token }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCoupons(token);
      if (res.success) {
        setCoupons(res.data || []);
      } else {
        setError(res.message || "Failed to fetch coupons");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading coupons.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code.trim() || !discountValue) {
      setError("Coupon code and discount value are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_amount: parseFloat(minOrderAmount || 0),
        expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null
      };

      const res = await createCoupon(token, payload);
      if (res.success) {
        setSuccess("Coupon created successfully!");
        // Reset form
        setCode("");
        setDiscountType("percentage");
        setDiscountValue("");
        setMinOrderAmount("");
        setExpiryDate("");
        // Reload list
        loadCoupons();
      } else {
        setError(res.message || "Failed to create coupon");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    setError("");
    setSuccess("");
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const res = await updateCoupon(token, couponId, { is_active: newStatus });
      if (res.success) {
        setSuccess(`Coupon ${newStatus === 1 ? "activated" : "deactivated"} successfully.`);
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, is_active: newStatus } : c));
      } else {
        setError(res.message || "Failed to update coupon status");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while updating coupon status.");
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      const res = await deleteCoupon(token, couponId);
      if (res.success) {
        setSuccess("Coupon deleted successfully.");
        setCoupons(prev => prev.filter(c => c.id !== couponId));
      } else {
        setError(res.message || "Failed to delete coupon");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while deleting the coupon.");
    }
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Never";
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    const expiry = new Date(dateString);
    return expiry.getTime() < Date.now();
  };

  return (
    <div className="container-fluid p-0">
      {/* Title block */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
            <Ticket className="text-warning" size={28} />
            Promo Coupons Manager
          </h3>
          <p className="text-muted text-sm m-0">Create, configure, and monitor customer promo codes</p>
        </div>
        <button 
          onClick={loadCoupons} 
          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
          disabled={loading}
        >
          Refresh List
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-2 shadow-sm py-2 px-3 mb-3">
          <AlertCircle size={18} />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success border-0 rounded-3 d-flex align-items-center gap-2 shadow-sm py-2 px-3 mb-3">
          <CheckCircle2 size={18} />
          <span className="text-xs font-semibold">{success}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Creation Form Column */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4">
            <h5 className="fw-extrabold text-dark mb-3 d-flex align-items-center gap-2">
              <Sparkles className="text-warning" size={18} />
              Create Promo Coupon
            </h5>
            <form onSubmit={handleCreate}>
              {/* Code */}
              <div className="mb-3">
                <label className="form-label text-xs fw-bold text-muted uppercase">Coupon Code</label>
                <input 
                  type="text" 
                  className="form-control rounded-3 py-2 text-sm font-semibold"
                  placeholder="e.g. SNACKY50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              {/* Discount Type & Value */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-xs fw-bold text-muted uppercase">Type</label>
                  <select 
                    className="form-select rounded-3 py-2 text-sm font-semibold"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-xs fw-bold text-muted uppercase">Discount Value</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted text-xs border-end-0 rounded-start-3">
                      {discountType === "percentage" ? <Percent size={14} /> : <Coins size={14} />}
                    </span>
                    <input 
                      type="number" 
                      min="1" 
                      step="any"
                      className="form-control rounded-end-3 py-2 text-sm font-semibold"
                      placeholder={discountType === "percentage" ? "20" : "100"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Min Order & Expiry */}
              <div className="mb-3">
                <label className="form-label text-xs fw-bold text-muted uppercase">Min Order Amount (₹)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="any"
                  className="form-control rounded-3 py-2 text-sm font-semibold"
                  placeholder="e.g. 150 (0 for no limit)"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-xs fw-bold text-muted uppercase">Expiry Date</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted text-xs border-end-0 rounded-start-3">
                    <Calendar size={14} />
                  </span>
                  <input 
                    type="datetime-local" 
                    className="form-control rounded-end-3 py-2 text-sm font-semibold"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-warning w-100 rounded-3 py-2 text-sm font-bold text-white shadow-sm"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Coupon"}
              </button>
            </form>
          </div>
        </div>

        {/* Coupons List Column */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4">
            <h5 className="fw-extrabold text-dark mb-4">Active Promo Coupons</h5>
            
            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
                Loading promo coupons...
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-5 text-muted italic">
                <Ticket className="mx-auto mb-2 text-muted" size={32} />
                <p className="m-0 text-sm">No promo coupons configured yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light text-secondary text-xs uppercase font-bold">
                    <tr>
                      <th>Code</th>
                      <th>Benefit</th>
                      <th>Requirements</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {coupons.map((coupon) => {
                      const expired = isExpired(coupon.expiry_date);
                      return (
                        <tr key={coupon.id}>
                          <td>
                            <span className="badge bg-warning bg-opacity-10 text-warning px-2.5 py-1.5 rounded font-mono font-bold uppercase">
                              {coupon.code}
                            </span>
                          </td>
                          <td className="font-bold text-dark">
                            {coupon.discount_type === "percentage" 
                              ? `${coupon.discount_value}% Off` 
                              : `₹${coupon.discount_value} Off`}
                          </td>
                          <td className="text-muted text-xs">
                            {parseFloat(coupon.min_order_amount) > 0 
                              ? `Min. order: ₹${coupon.min_order_amount}` 
                              : "No minimum order"}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1.5 text-xs">
                              <Clock size={12} className={expired ? "text-danger" : "text-muted"} />
                              <span className={expired ? "text-danger font-bold" : "text-muted"}>
                                {formatExpiryDate(coupon.expiry_date)}
                                {expired && " (Expired)"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
                              className={`btn btn-xs rounded-pill font-bold text-[10px] px-2 py-0.5 border-0 ${
                                coupon.is_active === 1 && !expired
                                  ? "bg-success bg-opacity-10 text-success"
                                  : "bg-secondary bg-opacity-10 text-secondary"
                              }`}
                              title="Click to toggle status"
                              disabled={expired}
                            >
                              {coupon.is_active === 1 && !expired ? "🟢 Active" : "🔴 Inactive"}
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="btn btn-link text-danger p-0 border-0"
                              title="Delete Coupon"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
