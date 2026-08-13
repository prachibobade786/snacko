import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Building, 
  MapPin, 
  Package, 
  LogOut, 
  ArrowLeft, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Search, 
  ShieldAlert,
  Calendar,
  CheckCircle,
  XCircle,
  Truck,
  Ticket
} from "lucide-react";
import logoImg from "../../assets/snackologo.png";
import useAppServices from "../../hooks/useAppServices";
import "./AdminPanel.css";
import CouponManager from "./CouponManager";

export default function AdminPanel() {
  const {
    adminTab,
    setAdminTab,
    adminWarehouses,
    selectedAdminWH,
    adminPincodes,
    adminInventory,
    newWHName,
    setNewWHName,
    newWHAddress,
    setNewWHAddress,
    newPincode,
    setNewPincode,
    stockEdits,
    loadingAdmin,
    fetchAdminWarehouses,
    selectWarehouseForAdmin,
    handleCreateWarehouse,
    handleUpdateWarehouse,
    handleAddPincode,
    handleRemovePincode,
    handleStockChange,
    handleSaveStock,
    adminStats,
    adminUsers,
    adminOrders,
    adminUserSearch,
    setAdminUserSearch,
    adminUserPage,
    setAdminUserPage,
    adminUserTotal,
    fetchAdminDashboardStats,
    fetchAdminUsersList,
    handleUpdateUserRole,
    handleDeleteUser,
    handleCreateWarehouseUser,
    fetchAdminOrdersList,
    handleUpdateOrderStatus,
    handleLogout,
    setMode,
    user,
    token
  } = useAppServices();

  const [localSearch, setLocalSearch] = useState("");

  // Warehouse User Creation Form States
  const [newWhUserName, setNewWhUserName] = useState("");
  const [newWhUserEmail, setNewWhUserEmail] = useState("");
  const [newWhUserPassword, setNewWhUserPassword] = useState("");
  const [newWhUserMobile, setNewWhUserMobile] = useState("");
  const [newWhUserWHId, setNewWhUserWHId] = useState("");

  // Rider Assignment Overlay States
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [assigningStatus, setAssigningStatus] = useState("");
  const [riderNameInput, setRiderNameInput] = useState("");
  const [riderPhoneInput, setRiderPhoneInput] = useState("");
  const [riderEtaInput, setRiderEtaInput] = useState("15");

  // Warehouse configuration edit states
  const [whStartTime, setWhStartTime] = useState("06:00");
  const [whEndTime, setWhEndTime] = useState("23:00");
  const [whNameEdit, setWhNameEdit] = useState("");
  const [whAddressEdit, setWhAddressEdit] = useState("");
  const [whIsActive, setWhIsActive] = useState(true);

  // Sync edit states when warehouse changes
  useEffect(() => {
    if (selectedAdminWH) {
      const formatTimeToHHMM = (timeStr) => {
        if (!timeStr) return "06:00";
        return timeStr.slice(0, 5);
      };
      setWhStartTime(formatTimeToHHMM(selectedAdminWH.delivery_start_time));
      setWhEndTime(formatTimeToHHMM(selectedAdminWH.delivery_end_time));
      setWhNameEdit(selectedAdminWH.name || "");
      setWhAddressEdit(selectedAdminWH.address || "");
      setWhIsActive(selectedAdminWH.is_active !== 0);
    }
  }, [selectedAdminWH]);

  // Fetch warehouses on mount so dropdown selections are populated
  useEffect(() => {
    fetchAdminWarehouses();
  }, []);

  // Load appropriate data when tab or parameters change
  useEffect(() => {
    if (adminTab === "dashboard") {
      fetchAdminDashboardStats();
    } else if (adminTab === "customer_users" || adminTab === "warehouse_users" || adminTab === "users") {
      fetchAdminUsersList();
    } else if (adminTab === "pincodes" && selectedAdminWH) {
      selectWarehouseForAdmin(selectedAdminWH);
    }
  }, [adminTab, adminUserPage, adminUserSearch, selectedAdminWH?.warehouse_id]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setAdminUserSearch(localSearch);
    setAdminUserPage(1);
  };

  const handleRefresh = () => {
    if (adminTab === "dashboard") {
      fetchAdminDashboardStats();
    } else if (adminTab === "customer_users" || adminTab === "warehouse_users" || adminTab === "users") {
      fetchAdminUsersList();
    } else if (adminTab === "pincodes" && selectedAdminWH) {
      selectWarehouseForAdmin(selectedAdminWH);
    }
  };

  // Helper status styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending": return "badge-pending";
      case "processing": return "badge-processing";
      case "shipped": return "badge-shipped";
      case "delivered": return "badge-delivered";
      case "cancelled": return "badge-cancelled";
      default: return "bg-secondary text-white";
    }
  };

  return (
    <div className="container-fluid p-0 admin-panel-container d-flex flex-column flex-md-row">
      
      {/* Sidebar Navigation */}
      <div className="col-12 col-md-3 col-xl-2 admin-sidebar d-flex flex-column justify-content-between p-3">
        <div>
          {/* Logo Brand Header */}
          <div className="d-flex align-items-center gap-2 mb-4 px-2 py-2">
            <div className="bg-white p-1.5 rounded-3 d-flex align-items-center shadow-sm">
              <img src={logoImg} alt="Snacko Logo" style={{ height: "26px" }} />
            </div>
            <span className="fw-extrabold text-white tracking-tight fs-5">Snacko Portal</span>
          </div>

          <div className="text-white text-uppercase tracking-wider small fw-bold px-3 mb-2" style={{ fontSize: "10px" }}>
            Management
          </div>

          <nav className="nav flex-column gap-1.5">
            <button 
              onClick={() => setAdminTab("dashboard")}
              className={`nav-link text-start d-flex align-items-center gap-2.5 ${adminTab === "dashboard" ? "active" : ""}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setAdminTab("customer_users")}
              className={`nav-link text-start d-flex align-items-center gap-2.5 ${adminTab === "customer_users" ? "active" : ""}`}
            >
              <Users size={18} />
              <span>Customer Users</span>
            </button>

            <button 
              onClick={() => setAdminTab("warehouse_users")}
              className={`nav-link text-start d-flex align-items-center gap-2.5 ${adminTab === "warehouse_users" ? "active" : ""}`}
            >
              <Building size={18} />
              <span>Warehouse Users</span>
            </button>

            <button 
              onClick={() => setAdminTab("pincodes")}
              className={`nav-link text-start d-flex align-items-center gap-2.5 ${adminTab === "pincodes" ? "active" : ""}`}
            >
              <MapPin size={18} />
              <span>Pincode Coverage</span>
            </button>

            <button 
              onClick={() => setAdminTab("coupons")}
              className={`nav-link text-start d-flex align-items-center gap-2.5 ${adminTab === "coupons" ? "active" : ""}`}
            >
              <Ticket size={18} />
              <span>Manage Coupons</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 px-2">
          {/* User profile info */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="admin-avatar text-uppercase">
              {user?.name?.slice(0, 2) || "AD"}
            </div>
            <div className="text-truncate">
              <div className="fw-bold text-white small text-truncate">{user?.name || "Admin Manager"}</div>
              <div className="text-muted small" style={{ fontSize: "10px" }}>System Administrator</div>
            </div>
          </div>



          <button 
            onClick={handleLogout}
            className="btn btn-danger btn-sm w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2"
            style={{ backgroundColor: "#ef4444", border: "none", fontSize: "12px" }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="col py-4 px-4 flex-grow-1 overflow-auto d-flex flex-column" style={{ maxHeight: "100vh" }}>
        
        {/* Workspace Top Header Bar */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light">
          <div>
            <h2 className="fw-bold text-dark mb-1 text-capitalize">
              {adminTab === "inventory" ? "Stock Control" : adminTab}
            </h2>
            <p className="text-muted small mb-0">
              {adminTab === "dashboard" && "Real-time dark store analytics and business metrics"}
              {adminTab === "users" && "Manage user accounts, privileges, and server credentials"}
              {adminTab === "orders" && "Track customer order fulfillments and delivery status"}
              {adminTab === "warehouses" && "Manage localized dark stores and product warehouse assets"}
              {adminTab === "pincodes" && `Linking and coverage management for dark store: ${selectedAdminWH?.name}`}
              {adminTab === "inventory" && `Manage product catalog stocking levels at: ${selectedAdminWH?.name}`}
            </p>
          </div>

          <button 
            onClick={handleRefresh}
            className="btn btn-white bg-white border rounded-pill p-2.5 shadow-sm d-flex align-items-center justify-content-center"
            title="Refresh panel details"
          >
            <RefreshCw size={16} className="text-secondary" />
          </button>
        </div>

        {/* Loading overlay spinner */}
        {loadingAdmin && adminTab !== "inventory" ? (
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-5 text-secondary gap-3">
            <div className="spinner-border text-orange" role="status" style={{ color: "#ff6500" }}></div>
            <span className="small fw-semibold">Loading portal data...</span>
          </div>
        ) : (
          <div className="flex-grow-1">
            {/* Dashboard Statistics Tab Panel */}
            {adminTab === "dashboard" && (
              <div className="fade-in d-flex flex-column gap-4">
                {/* General Stats Tiles */}
                <div className="row g-3">
                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card admin-stat-card border-0 p-4 shadow-sm bg-white rounded-4 position-relative overflow-hidden">
                      <span className="text-muted font-bold text-xs uppercase d-block mb-1">Total Sales</span>
                      <h2 className="mb-0 font-extrabold text-dark">₹{(adminStats?.totalSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                      <div className="position-absolute opacity-10 text-primary" style={{ bottom: 15, right: 20 }}>
                        <ShoppingBag size={48} style={{ color: "#ff6500" }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card admin-stat-card border-0 p-4 shadow-sm bg-white rounded-4 position-relative overflow-hidden">
                      <span className="text-muted font-bold text-xs uppercase d-block mb-1">Total Orders</span>
                      <h2 className="mb-0 font-extrabold text-dark">{adminStats?.totalOrders || 0}</h2>
                      <div className="position-absolute opacity-10 text-primary" style={{ bottom: 15, right: 20 }}>
                        <ShoppingBag size={48} style={{ color: "#3b82f6" }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card admin-stat-card border-0 p-4 shadow-sm bg-white rounded-4 position-relative overflow-hidden">
                      <span className="text-muted font-bold text-xs uppercase d-block mb-1">Total Customers</span>
                      <h2 className="mb-0 font-extrabold text-dark">{adminStats?.totalCustomers || 0}</h2>
                      <div className="position-absolute opacity-10 text-primary" style={{ bottom: 15, right: 20 }}>
                        <Users size={48} style={{ color: "#10b981" }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card admin-stat-card border-0 p-4 shadow-sm bg-white rounded-4 position-relative overflow-hidden">
                      <span className="text-muted font-bold text-xs uppercase d-block mb-1">Products Catalog</span>
                      <h2 className="mb-0 font-extrabold text-dark">{adminStats?.totalProducts || 0}</h2>
                      <div className="position-absolute opacity-10 text-primary" style={{ bottom: 15, right: 20 }}>
                        <Package size={48} style={{ color: "#8b5cf6" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Warning Alert Block */}
                {(adminStats?.stockStatus?.outOfStock > 0 || adminStats?.stockStatus?.lowStock > 0) && (
                  <div className="card border-0 rounded-4 p-3 shadow-sm bg-warning bg-opacity-10 border-start border-warning border-3 d-flex flex-row align-items-center gap-3">
                    <ShieldAlert className="text-warning flex-shrink-0" size={24} />
                    <div>
                      <span className="fw-bold text-dark d-block">Inventory Attention Required</span>
                      <span className="text-muted small">
                        There are <strong className="text-danger">{adminStats?.stockStatus?.outOfStock || 0}</strong> products out of stock and <strong className="text-warning">{adminStats?.stockStatus?.lowStock || 0}</strong> products running low on stock across warehouses.
                      </span>
                    </div>
                  </div>
                )}

                {/* Warehouse-Wise Statistics Table */}
                <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-extrabold text-dark mb-1">Warehouse Performance Statistics</h4>
                      <p className="text-muted small mb-0">Sales and order volumes segmented by physical dark store location</p>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr className="small text-muted font-bold text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                          <th className="py-3 px-3">Dark Store / Warehouse</th>
                          <th className="py-3 text-center bg-light bg-opacity-50">Today's Orders</th>
                          <th className="py-3 text-center bg-light bg-opacity-50 border-end">Today's Sales</th>
                          <th className="py-3 text-center">Weekly Orders</th>
                          <th className="py-3 text-center border-end">Weekly Sales</th>
                          <th className="py-3 text-center bg-light bg-opacity-50">Monthly Orders</th>
                          <th className="py-3 text-center bg-light bg-opacity-50">Monthly Sales</th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {adminStats?.warehouseStats?.map((wh) => (
                          <tr key={wh.warehouse_id} className="align-middle">
                            <td className="px-3 py-3.5">
                              <div className="d-flex align-items-center gap-2">
                                <div className="admin-avatar text-uppercase bg-primary bg-opacity-10 text-primary" style={{ width: "32px", height: "32px", fontSize: "11px", boxShadow: "none" }}>
                                  {wh.warehouse_name ? wh.warehouse_name.slice(0, 2) : "WH"}
                                </div>
                                <div>
                                  <span className="fw-bold text-dark d-block">{wh.warehouse_name}</span>
                                  <span className="text-muted text-xs">ID: {wh.warehouse_id}</span>
                                </div>
                              </div>
                            </td>
                            {/* Today */}
                            <td className="text-center py-3 bg-light bg-opacity-50 fw-semibold text-dark">
                              {wh.today_order_count}
                            </td>
                            <td className="text-center py-3 bg-light bg-opacity-50 border-end fw-bold text-primary">
                              ₹{Number(wh.today_order_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            {/* Week */}
                            <td className="text-center py-3 fw-semibold text-dark">
                              {wh.week_order_count}
                            </td>
                            <td className="text-center py-3 border-end fw-bold text-primary">
                              ₹{Number(wh.week_order_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            {/* Month */}
                            <td className="text-center py-3 bg-light bg-opacity-50 fw-semibold text-dark">
                              {wh.month_order_count}
                            </td>
                            <td className="text-center py-3 bg-light bg-opacity-50 fw-bold text-primary">
                              ₹{Number(wh.month_order_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                        {(!adminStats?.warehouseStats || adminStats.warehouseStats.length === 0) && (
                          <tr>
                            <td colSpan="7" className="text-center text-muted py-4">No warehouse data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 1. PANEL: CUSTOMER USERS */}
            {adminTab === "customer_users" && (
              <div className="card border-0 rounded-4 p-4 shadow-sm bg-white fade-in">
                <h4 className="fw-extrabold text-dark mb-4">Customer Accounts</h4>
                {/* Search Bar */}
                <form onSubmit={onSearchSubmit} className="d-flex gap-2 max-w-md mb-4">
                  <div className="input-group border rounded-pill px-3 py-1 bg-light flex-grow-1 align-items-center">
                    <Search size={16} className="text-muted me-2" />
                    <input 
                      type="text" 
                      placeholder="Search customers by name/email..."
                      className="form-control border-0 bg-transparent py-1.5"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      style={{ fontSize: "13px", outline: "none", boxShadow: "none" }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Search</button>
                </form>

                {/* Users Table */}
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr className="small text-muted font-bold">
                        <th className="py-3 px-3">Name</th>
                        <th className="py-3">Email</th>
                        <th className="py-3">Mobile</th>
                        <th className="py-3 text-end px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {adminUsers.filter(u => u.role === "customer").map(u => (
                        <tr key={u.id}>
                          <td className="px-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="admin-avatar text-uppercase" style={{ width: "32px", height: "32px", fontSize: "11px" }}>
                                {u.name.slice(0, 2)}
                              </div>
                              <span className="fw-bold text-dark">{u.name}</span>
                            </div>
                          </td>
                          <td className="text-muted">{u.email}</td>
                          <td>{u.mobile || "N/A"}</td>
                          <td className="text-end px-3">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-outline-danger btn-sm rounded-circle p-2"
                              title="Delete user"
                              style={{ border: "none" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {adminUsers.filter(u => u.role === "customer").length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">No customer users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. PANEL: WAREHOUSE USERS */}
            {adminTab === "warehouse_users" && (
              <div className="fade-in d-flex flex-column gap-4">
                {/* Warehouse Users List */}
                <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
                  <h4 className="fw-extrabold text-dark mb-4">Warehouse Staff Accounts</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr className="small text-muted font-bold">
                          <th className="py-3 px-3">Staff Name</th>
                          <th className="py-3">Email Address</th>
                          <th className="py-3">Contact</th>
                          <th className="py-3">Mapped Dark Store</th>
                          <th className="py-3 text-end px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {adminUsers.filter(u => u.role === "admin").map(u => {
                          const whName = adminWarehouses.find(w => w.warehouse_id === u.warehouse_id)?.name || `Warehouse (ID: ${u.warehouse_id})`;
                          return (
                            <tr key={u.id}>
                              <td className="px-3">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="admin-avatar text-uppercase bg-warning bg-opacity-20 text-warning" style={{ width: "32px", height: "32px", fontSize: "11px" }}>
                                    {u.name.slice(0, 2)}
                                  </div>
                                  <span className="fw-bold text-dark">{u.name}</span>
                                </div>
                              </td>
                              <td className="text-muted">{u.email}</td>
                              <td>{u.mobile || "N/A"}</td>
                              <td>
                                <span className="badge bg-dark text-white rounded-pill px-2.5 py-1.5 fw-bold">
                                  {u.warehouse_id ? whName : "Super Admin"}
                                </span>
                              </td>
                              <td className="text-end px-3">
                                {u.email !== "admin@snacko.com" && (
                                  <button 
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="btn btn-outline-danger btn-sm rounded-circle p-2"
                                    title="Delete user"
                                    style={{ border: "none" }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {adminUsers.filter(u => u.role === "admin").length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-4">No warehouse staff found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Creation Form: ONLY Admin can set password */}
                <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
                  <h4 className="fw-extrabold text-dark mb-1">Create Warehouse Staff Account</h4>
                  <p className="text-muted text-xs mb-4">Set credentials and assign dark store mapping for a new warehouse user</p>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const payload = {
                      name: newWhUserName,
                      email: newWhUserEmail,
                      password: newWhUserPassword,
                      mobile: newWhUserMobile,
                      warehouse_id: newWhUserWHId || null
                    };
                    const res = await handleCreateWarehouseUser(payload);
                    if (res.success) {
                      setNewWhUserName("");
                      setNewWhUserEmail("");
                      setNewWhUserPassword("");
                      setNewWhUserMobile("");
                      setNewWhUserWHId("");
                    }
                  }} className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Rahul Sharma" 
                        required
                        className="form-control rounded-3 py-2 text-xs"
                        value={newWhUserName}
                        onChange={(e) => setNewWhUserName(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. rahul@snacko.com" 
                        required
                        className="form-control rounded-3 py-2 text-xs"
                        value={newWhUserEmail}
                        onChange={(e) => setNewWhUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Password</label>
                      <input 
                        type="password" 
                        placeholder="Create strong password" 
                        required
                        className="form-control rounded-3 py-2 text-xs"
                        value={newWhUserPassword}
                        onChange={(e) => setNewWhUserPassword(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Mobile Number (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 9876543210" 
                        className="form-control rounded-3 py-2 text-xs"
                        value={newWhUserMobile}
                        onChange={(e) => setNewWhUserMobile(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Assign Dark Store</label>
                      <select 
                        required
                        className="form-select rounded-3 py-2 text-xs"
                        value={newWhUserWHId}
                        onChange={(e) => setNewWhUserWHId(e.target.value)}
                      >
                        <option value="">-- Mapped Warehouse --</option>
                        {adminWarehouses.map(wh => (
                          <option key={wh.warehouse_id} value={wh.warehouse_id}>
                            {wh.name} (ID: {wh.warehouse_id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 d-flex justify-content-end mt-4">
                      <button type="submit" className="btn btn-primary rounded-pill font-bold px-4 py-2 text-white text-xs">
                        Create Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 3. PANEL: PINCODES */}
            {adminTab === "pincodes" && (
              <div className="fade-in d-flex flex-column gap-4">
                {/* Pincode Control Card */}
                <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
                  <div className="mb-4">
                    <h4 className="fw-extrabold text-dark mb-1">Pincode Coverage Control</h4>
                    <p className="text-muted small">Select a dark store warehouse to manage its serviced pincodes</p>
                  </div>

                  <div className="mb-4 bg-light p-3 rounded-4" style={{ maxWidth: "450px" }}>
                    <label className="form-label small fw-bold text-secondary mb-2 block">Choose Dark Store:</label>
                    <select
                      value={selectedAdminWH?.warehouse_id || ""}
                      onChange={(e) => {
                        const whObj = adminWarehouses.find(w => w.warehouse_id === parseInt(e.target.value));
                        if (whObj) selectWarehouseForAdmin(whObj);
                      }}
                      className="form-select rounded-3 py-2 text-xs"
                    >
                      <option value="">-- Choose Warehouse --</option>
                      {adminWarehouses.map(wh => (
                        <option key={wh.warehouse_id} value={wh.warehouse_id}>
                          {wh.name} (ID: {wh.warehouse_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedAdminWH ? (
                    <>
                      <div className="mb-3">
                        <span className="small text-muted font-bold uppercase tracking-wider">Serviced Areas ({adminPincodes.length})</span>
                      </div>
                      <div className="d-flex flex-wrap gap-2.5 mb-4 p-3 bg-light rounded-4">
                        {adminPincodes.length === 0 ? (
                          <span className="text-muted small italic p-2">No postal codes mapped to this dark store yet.</span>
                        ) : (
                          adminPincodes.map(p => (
                            <span key={p.id} className="d-inline-flex align-items-center gap-2 bg-white border text-dark text-xs font-extrabold px-3 py-2 rounded-pill shadow-sm">
                              <span>{p.pincode}</span>
                              <button 
                                onClick={() => handleRemovePincode(p.pincode)}
                                className="btn btn-sm p-0 border-0 rounded-circle text-muted hover:text-danger d-flex align-items-center justify-content-center"
                                title="Remove served pincode linkage"
                                style={{ width: "16px", height: "16px" }}
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Operational Timings & General Settings Form */}
                      <div className="border-top pt-4 mb-4">
                        <h5 className="fw-bold text-dark mb-1">Store Operational settings & Timings</h5>
                        <p className="text-muted text-xs mb-3">Configure active delivery operating hours and physical storefront details</p>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const res = await handleUpdateWarehouse(
                            selectedAdminWH.warehouse_id, 
                            whNameEdit, 
                            whAddressEdit, 
                            whStartTime ? `${whStartTime}:00` : "06:00:00", 
                            whEndTime ? `${whEndTime}:00` : "23:00:00",
                            whIsActive
                          );
                        }} className="row g-3">
                          <div className="col-12 col-md-6">
                            <label className="form-label small fw-bold">Fulfillment Center Name</label>
                            <input 
                              type="text" 
                              required
                              className="form-control rounded-3 py-2 text-xs font-semibold text-slate-800"
                              value={whNameEdit}
                              onChange={(e) => setWhNameEdit(e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label small fw-bold">Physical Address</label>
                            <input 
                              type="text" 
                              required
                              className="form-control rounded-3 py-2 text-xs font-semibold text-slate-800"
                              value={whAddressEdit}
                              onChange={(e) => setWhAddressEdit(e.target.value)}
                            />
                          </div>
                          <div className="col-6 col-md-4">
                            <label className="form-label small fw-bold">Deliveries Start Hour</label>
                            <input 
                              type="time" 
                              required
                              className="form-control rounded-3 py-2 text-xs font-semibold text-slate-800"
                              value={whStartTime}
                              onChange={(e) => setWhStartTime(e.target.value)}
                            />
                          </div>
                          <div className="col-6 col-md-4">
                            <label className="form-label small fw-bold">Last Delivery Completion Hour</label>
                            <input 
                              type="time" 
                              required
                              className="form-control rounded-3 py-2 text-xs font-semibold text-slate-800"
                              value={whEndTime}
                              onChange={(e) => setWhEndTime(e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label small fw-bold">Operational Status</label>
                            <select 
                              className="form-select rounded-3 py-2 text-xs font-semibold text-slate-800"
                              value={whIsActive ? "1" : "0"}
                              onChange={(e) => setWhIsActive(e.target.value === "1")}
                            >
                              <option value="1">🟢 Active / Open</option>
                              <option value="0">🔴 Inactive / Closed</option>
                            </select>
                          </div>
                          <div className="col-12 mt-3">
                            <button type="submit" className="btn btn-warning w-100 rounded-3 text-xs font-bold text-white py-2 shadow-sm">
                              Save Configuration
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Add Pincode Link Form */}
                      <div className="border-t pt-4">
                        <h5 className="fw-bold text-dark mb-3">Link New Pincode</h5>
                        <form onSubmit={handleAddPincode} className="d-flex gap-2 max-w-sm">
                          <input 
                            type="text" 
                            placeholder="Enter 6-digit Pincode (e.g. 122003)"
                            maxLength={10}
                            required
                            className="form-control py-2 rounded-3 text-xs"
                            value={newPincode}
                            onChange={(e) => setNewPincode(e.target.value)}
                            style={{ fontSize: "12px" }}
                          />
                          <button type="submit" className="btn btn-primary rounded-3 px-4 font-bold text-white d-flex align-items-center gap-1 text-xs">
                            <Plus size={16} /> 
                            <span>Link Area</span>
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <MapPin size={48} className="text-slate-300 mb-3" />
                      <p className="small font-bold">Please select a warehouse from the dropdown above to manage its pincodes.</p>
                    </div>
                  )}
                </div>

                {/* Create Warehouse Form Card */}
                <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
                  <h4 className="fw-extrabold text-dark mb-1">Create New Dark Store Warehouse</h4>
                  <p className="text-muted text-xs mb-4">Add a new physical dark store location to the delivery network</p>
                  <form onSubmit={handleCreateWarehouse} className="row g-3">
                    <div className="col-12 col-md-5">
                      <input 
                        type="text" 
                        placeholder="Warehouse Name (e.g. Pune Central)"
                        required
                        className="form-control py-2.5 rounded-3 text-xs"
                        value={newWHName}
                        onChange={(e) => setNewWHName(e.target.value)}
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                    <div className="col-12 col-md-5">
                      <input 
                        type="text" 
                        placeholder="Warehouse Address (e.g. Kharadi)"
                        required
                        className="form-control py-2.5 rounded-3 text-xs"
                        value={newWHAddress}
                        onChange={(e) => setNewWHAddress(e.target.value)}
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                    <div className="col-12 col-md-2">
                      <button type="submit" className="btn btn-primary py-2.5 w-100 rounded-3 text-xs font-bold text-white d-flex align-items-center justify-content-center gap-1">
                        <Plus size={16} /> 
                        <span>Add WH</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {adminTab === "coupons" && (
              <CouponManager token={token} />
            )}
          </div>
        )}

      </div>

      {/* Assign Rider Custom Modal */}
      {assigningOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="bg-white rounded-4 p-4 shadow-lg border w-100" style={{ maxWidth: "450px" }}>
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Truck className="text-primary" size={20} /> Assign Rider Details
            </h4>
            <p className="text-muted small mb-4">Set delivery details for Order #{assigningOrder.order_id}</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateOrderStatus(assigningOrder.order_id, assigningStatus, {
                delivery_partner_name: riderNameInput,
                delivery_partner_phone: riderPhoneInput,
                estimated_delivery_minutes: parseInt(riderEtaInput) || 15
              });
              setAssigningOrder(null);
            }}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Rider Full Name</label>
                <input 
                  type="text" 
                  required
                  id="rider-name-input"
                  className="form-control rounded-3" 
                  placeholder="e.g. Ravi Kumar"
                  value={riderNameInput}
                  onChange={(e) => setRiderNameInput(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Rider Contact Number</label>
                <input 
                  type="text" 
                  required
                  id="rider-phone-input"
                  className="form-control rounded-3" 
                  placeholder="e.g. 9876543210"
                  value={riderPhoneInput}
                  onChange={(e) => setRiderPhoneInput(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Estimated Delivery time (Minutes)</label>
                <input 
                  type="number" 
                  required
                  id="rider-eta-input"
                  className="form-control rounded-3" 
                  placeholder="e.g. 15"
                  value={riderEtaInput}
                  onChange={(e) => setRiderEtaInput(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" id="rider-save-btn" className="btn btn-primary rounded-3 flex-grow-1">Save & Dispatch</button>
                <button 
                  type="button" 
                  id="rider-cancel-btn"
                  onClick={() => setAssigningOrder(null)} 
                  className="btn btn-outline-secondary rounded-3 flex-grow-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
