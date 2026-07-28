import React, { useEffect, useState } from "react";
import {
  Building,
  ShoppingBag,
  Package,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  Printer,
  QrCode,
  LayoutDashboard,
  LogOut,
  User,
  Activity,
  UserCheck,
  PackageCheck
} from "lucide-react";
import useAppServices from "../../hooks/useAppServices";
import * as api from "../../api/api";
import logoImg from "../../assets/snackologo.png";
import "./WarehousePortal.css";

export default function WarehousePortal() {
  const {
    token,
    user,
    mode,
    setMode,
    handleLogout,
    adminWarehouses,
    selectedAdminWH,
    selectWarehouseForAdmin,
    warehouseOrders,
    warehouseOrdersLoading,
    fetchWarehouseOrders,
    adminInventory,
    stockEdits,
    handleStockChange,
    handleSaveStock,
    adminPincodes,
    newPincode,
    setNewPincode,
    handleAddPincode,
    handleRemovePincode,
    handleUpdateOrderStatus,
    showToast,
    categories,
    fetchCategories
  } = useAppServices();

  const [portalTab, setPortalTab] = useState("packing"); // packing, dispatch, stock, pincodes
  const [packingOrder, setPackingOrder] = useState(null);
  const [packingItems, setPackingItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [packedStatuses, setPackedStatuses] = useState({}); // { item_id: boolean }

  // Custom Product Creation States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategoryId, setNewProdCategoryId] = useState("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImage, setNewProdImage] = useState("");

  // Rider dispatch form states
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderEta, setRiderEta] = useState("10");

  // Search & Filters for Inventory
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("All");
  const [stockPage, setStockPage] = useState(1);

  // Reset stock page when filter/search/warehouse changes
  useEffect(() => {
    setStockPage(1);
  }, [stockSearch, stockCategoryFilter, selectedAdminWH?.warehouse_id]);

  // Pagination for Incoming Orders Packing Queue
  const [packingPage, setPackingPage] = useState(1);

  // Reset page when warehouse changes
  useEffect(() => {
    setPackingPage(1);
  }, [selectedAdminWH?.warehouse_id]);

  // Initial load
  useEffect(() => {
    if (adminWarehouses.length > 0) {
      const mappedWH = user?.warehouse_id
        ? adminWarehouses.find(w => w.warehouse_id === user.warehouse_id)
        : null;

      if (mappedWH) {
        selectWarehouseForAdmin(mappedWH);
      } else if (!selectedAdminWH || !adminWarehouses.find(w => w.warehouse_id === selectedAdminWH.warehouse_id)) {
        selectWarehouseForAdmin(adminWarehouses[0]);
      }
    }
  }, [adminWarehouses, user?.warehouse_id]);

  // Reload orders & inventory on tab changes or warehouse switch
  const handleRefresh = () => {
    if (selectedAdminWH) {
      const whId = selectedAdminWH.warehouse_id;
      selectWarehouseForAdmin(selectedAdminWH); // triggers pincodes and inventory refresh
      fetchWarehouseOrders(whId);
    }
  };

  useEffect(() => {
    if (selectedAdminWH) {
      fetchWarehouseOrders(selectedAdminWH.warehouse_id);
    }
  }, [selectedAdminWH?.warehouse_id]);

  // Load items for packing checklist
  const handleOpenPackingChecklist = async (order) => {
    setPackingOrder(order);
    setLoadingItems(true);
    setPackedStatuses({});
    try {
      const res = await api.fetchOrderItems(token, order.order_id);
      if (res.success) {
        const items = res.data || [];
        setPackingItems(items);
        // Initialize all as unpacked
        const initialStatuses = {};
        items.forEach(item => {
          initialStatuses[item.id] = false;
        });
        setPackedStatuses(initialStatuses);
      }
    } catch (err) {
      console.error("Failed to load order items:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  // Toggle single item packed status
  const handleToggleItemPacked = (itemId) => {
    setPackedStatuses(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Auto-pack all items
  const handleAutoPackAll = () => {
    const allPacked = {};
    packingItems.forEach(item => {
      allPacked[item.id] = true;
    });
    setPackedStatuses(allPacked);
  };

  // Confirm packed and move to ready state (processing status)
  const handleConfirmPacked = async () => {
    if (!packingOrder) return;
    try {
      // Set order status to processing (packed & ready for dispatch)
      await handleUpdateOrderStatus(packingOrder.order_id, "processing");
      setPackingOrder(null);
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Open Rider dispatch form
  const handleOpenDispatchForm = (order) => {
    setDispatchOrder(order);
    // Pre-fill some default quick commerce delivery rider names
    const mockNames = ["Ramesh Kumar", "Vikram Singh", "Amit Patel", "Rahul Sharma", "Suresh Das"];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    setRiderName(randomName);
    setRiderPhone("98" + Math.floor(10000000 + Math.random() * 90000000));
    setRiderEta("12");
  };

  // Dispatch order to rider (shipped status)
  const handleDispatchOrder = async (e) => {
    e.preventDefault();
    if (!dispatchOrder) return;
    try {
      await handleUpdateOrderStatus(dispatchOrder.order_id, "shipped", {
        delivery_partner_name: riderName,
        delivery_partner_phone: riderPhone,
        estimated_delivery_minutes: parseInt(riderEta) || 15
      });
      setDispatchOrder(null);
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Complete delivery (delivered status)
  const handleMarkDelivered = async (orderId) => {
    try {
      await handleUpdateOrderStatus(orderId, "delivered");
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle stock availability: quick commerce toggle
  const handleToggleStockStatus = async (productId, currentStock) => {
    if (!selectedAdminWH) return;
    const whId = selectedAdminWH.warehouse_id;
    // If stock > 0, set to 0 (Out of stock)
    // If stock == 0, set to default high quantity 80 (In stock)
    const newQty = currentStock > 0 ? 0 : 80;
    try {
      await api.updateWarehouseStock(token, whId, productId, newQty);
      selectWarehouseForAdmin(selectedAdminWH); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  // Handle adding custom product and category
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdminWH || !token) return;
    const whId = selectedAdminWH.warehouse_id;

    try {
      let catId = newProdCategoryId;

      // 1. Create category if requested
      if (isCreatingNewCategory) {
        if (!newCategoryName.trim()) {
          alert("Category Name is required");
          return;
        }
        const catRes = await api.createCategory(token, {
          category_name: newCategoryName.trim(),
          category_description: newCategoryDesc.trim() || null,
          category_image: "default_cat.png"
        });
        if (catRes.success) {
          catId = catRes.category_id;
        } else {
          alert(catRes.message || "Failed to create category");
          return;
        }
      }

      if (!catId) {
        alert("Please select or create a category");
        return;
      }

      // 2. Create product
      const prodRes = await api.createProduct(token, {
        category_id: parseInt(catId),
        product_name: newProdName.trim(),
        product_description: newProdDesc.trim() || null,
        price: parseFloat(newProdPrice),
        stock_quantity: parseInt(newProdStock) || 0,
        product_image: newProdImage.trim() || "default_food.png",
        is_available: true
      });

      if (prodRes.success) {
        alert("Product created successfully!");
        // Reset form
        setNewProdName("");
        setNewProdCategoryId("");
        setIsCreatingNewCategory(false);
        setNewCategoryName("");
        setNewCategoryDesc("");
        setNewProdPrice("");
        setNewProdStock("10");
        setNewProdDesc("");
        setNewProdImage("");
        setShowAddProductModal(false);

        // Refresh data
        selectWarehouseForAdmin(selectedAdminWH);
      } else {
        alert(prodRes.message || "Failed to create product");
      }
    } catch (err) {
      console.error("Failed to add product:", err);
      alert("Error adding product");
    }
  };

  // Filter orders by status
  const pendingPackingOrders = warehouseOrders.filter(o => o.status === "pending");

  // Packing Queue Pagination
  const ordersPerPage = 10;
  const totalPages = Math.ceil(pendingPackingOrders.length / ordersPerPage);
  const startIndex = (packingPage - 1) * ordersPerPage;
  const paginatedPendingOrders = pendingPackingOrders.slice(startIndex, startIndex + ordersPerPage);

  const readyDispatchOrders = warehouseOrders.filter(o => o.status === "processing");
  const outForDeliveryOrders = warehouseOrders.filter(o => o.status === "shipped");
  const completedOrders = warehouseOrders.filter(o => o.status === "delivered" || o.status === "cancelled");

  // Filter stock inventory
  const filteredInventory = adminInventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(stockSearch.toLowerCase()) ||
      item.category_name.toLowerCase().includes(stockSearch.toLowerCase());
    const matchesCategory = stockCategoryFilter === "All" || item.category_name === stockCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stock Adjuster Pagination
  const stockPerPage = 10;
  const totalStockPages = Math.ceil(filteredInventory.length / stockPerPage);
  const stockStartIndex = (stockPage - 1) * stockPerPage;
  const paginatedInventory = filteredInventory.slice(stockStartIndex, stockStartIndex + stockPerPage);

  // Get unique categories for inventory filter
  const categoriesList = ["All", ...new Set(adminInventory.map(item => item.category_name))];

  // Stats calculation
  const totalOrdersCount = warehouseOrders.length;
  const pendingPackingCount = pendingPackingOrders.length;
  const readyDispatchCount = readyDispatchOrders.length;
  const outForDeliveryCount = outForDeliveryOrders.length;
  const lowStockCount = adminInventory.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length;
  const outOfStockCount = adminInventory.filter(item => item.stock_quantity === 0).length;

  return (
    <div className="warehouse-portal-container">
      {/* Top Banner Header */}
      <header className="wh-header d-flex flex-wrap align-items-center justify-content-between p-3">
        <div className="d-flex align-items-center gap-3">
          <div className="wh-logo-wrapper p-2 bg-white rounded-3 d-flex align-items-center shadow-sm">
            <img src={logoImg} alt="Snacko Logo" style={{ height: "30px" }} />
          </div>
          <div>
            <h1 className="wh-title mb-0">Snacko Warehouse Store Portal</h1>
            <span className="wh-subtitle text-muted text-xs uppercase tracking-wider">
              ⚡ Quick Commerce Fulfillment Center
            </span>
          </div>
        </div>

        {/* Warehouse Selection Context */}
        <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
          <div className="wh-selector-group d-flex align-items-center bg-dark text-white rounded-3 px-3 py-2 border border-secondary border-opacity-25 shadow-sm">
            <Building size={16} className="text-warning mr-2" />
            <span className="text-white font-bold text-sm">
              {selectedAdminWH ? `${selectedAdminWH.name} (ID: ${selectedAdminWH.warehouse_id})` : "Loading Store..."}
            </span>
          </div>

          {user && (
            <div className="d-none d-lg-flex align-items-center gap-2 bg-light px-3 py-2 rounded-3 text-xs border">
              <User size={14} className="text-secondary" />
              <span className="text-secondary font-semibold">Logged in: </span>
              <span className="text-dark font-bold">{user.email}</span>
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="btn btn-dark p-2.5 rounded-3 d-flex align-items-center justify-content-center"
            title="Refresh current store stats"
          >
            <RefreshCw size={16} />
          </button>

          {!user?.warehouse_id && (
            <button
              onClick={() => setMode("customer")}
              className="btn btn-outline-warning text-sm rounded-3 font-bold py-2 px-3 flex align-items-center gap-1.5"
              style={{ border: "1.5px solid var(--primary-color)", color: "var(--primary-color)" }}
            >
              <ArrowLeft size={14} />
              <span>Storefront</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="btn btn-outline-danger text-sm rounded-3 font-bold py-2 px-3 flex align-items-center gap-1.5"
            style={{ border: "1.5px solid #ef4444", color: "#ef4444" }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Core Dashboard Grid */}
      <div className="container-fluid px-3 py-4">
        {/* Real-time Metrics Tiles */}
        <section className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-lg-2.4 col-xl-2">
            <div className="wh-stat-card card border-0 p-3 bg-white shadow-sm rounded-4 position-relative overflow-hidden">
              <span className="stat-label text-muted font-bold text-xs uppercase d-block mb-1">Total Orders</span>
              <h3 className="stat-val mb-0 font-extrabold text-dark">{totalOrdersCount}</h3>
              <Activity size={32} className="stat-icon position-absolute opacity-10 text-primary" style={{ bottom: 10, right: 10 }} />
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2.4 col-xl-2">
            <div className={`wh-stat-card card border-0 p-3 bg-white shadow-sm rounded-4 position-relative overflow-hidden ${pendingPackingCount > 0 ? "border-left-danger" : ""}`}>
              <span className="stat-label text-muted font-bold text-xs uppercase d-block mb-1">Pending Packing</span>
              <h3 className={`stat-val mb-0 font-extrabold ${pendingPackingCount > 0 ? "text-danger" : "text-dark"}`}>{pendingPackingCount}</h3>
              <Package size={32} className="stat-icon position-absolute opacity-10 text-danger" style={{ bottom: 10, right: 10 }} />
              {pendingPackingCount > 0 && <span className="pulsing-badge-dot"></span>}
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2.4 col-xl-2">
            <div className="wh-stat-card card border-0 p-3 bg-white shadow-sm rounded-4 position-relative overflow-hidden">
              <span className="stat-label text-muted font-bold text-xs uppercase d-block mb-1">Ready to Ship</span>
              <h3 className="stat-val mb-0 font-extrabold text-warning">{readyDispatchCount}</h3>
              <UserCheck size={32} className="stat-icon position-absolute opacity-10 text-warning" style={{ bottom: 10, right: 10 }} />
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2.4 col-xl-2">
            <div className="wh-stat-card card border-0 p-3 bg-white shadow-sm rounded-4 position-relative overflow-hidden">
              <span className="stat-label text-muted font-bold text-xs uppercase d-block mb-1">Out For Delivery</span>
              <h3 className="stat-val mb-0 font-extrabold text-success">{outForDeliveryCount}</h3>
              <Truck size={32} className="stat-icon position-absolute opacity-10 text-success" style={{ bottom: 10, right: 10 }} />
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2.4 col-xl-2">
            <div className="wh-stat-card card border-0 p-3 bg-white shadow-sm rounded-4 position-relative overflow-hidden">
              <span className="stat-label text-muted font-bold text-xs uppercase d-block mb-1">Low Inventory</span>
              <h3 className={`stat-val mb-0 font-extrabold ${lowStockCount > 0 ? "text-danger" : "text-dark"}`}>{lowStockCount}</h3>
              <AlertTriangle size={32} className="stat-icon position-absolute opacity-10 text-danger" style={{ bottom: 10, right: 10 }} />
            </div>
          </div>
        </section>

        {/* Tab Selection Navigation */}
        <div className="wh-tab-bar d-flex gap-2 mb-4 border-bottom border-light pb-2 overflow-auto">
          <button
            onClick={() => setPortalTab("packing")}
            className={`btn rounded-pill font-bold px-4 py-2 text-sm border-0 ${portalTab === "packing" ? "btn-yellow text-white active" : "btn-secondary bg-white text-muted"}`}
          >
            📦 Order Packing Desk ({pendingPackingCount})
          </button>
          <button
            onClick={() => setPortalTab("dispatch")}
            className={`btn rounded-pill font-bold px-4 py-2 text-sm border-0 ${portalTab === "dispatch" ? "btn-yellow text-white active" : "btn-secondary bg-white text-muted"}`}
          >
            🛵 Rider Dispatch Desk ({readyDispatchCount + outForDeliveryCount})
          </button>
          <button
            onClick={() => setPortalTab("stock")}
            className={`btn rounded-pill font-bold px-4 py-2 text-sm border-0 ${portalTab === "stock" ? "btn-yellow text-white active" : "btn-secondary bg-white text-muted"}`}
          >
            📊 Dark Store Stock Control
          </button>
          <button
            onClick={() => setPortalTab("pincodes")}
            className={`btn rounded-pill font-bold px-4 py-2 text-sm border-0 ${portalTab === "pincodes" ? "btn-yellow text-white active" : "btn-secondary bg-white text-muted"}`}
          >
            📍 Delivery Coverage Areas
          </button>
        </div>

        {/* LOADING SCREEN */}
        {warehouseOrdersLoading && portalTab === "packing" && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary gap-2">
            <div className="spinner-border text-warning" role="status" style={{ color: "var(--primary-color)" }}></div>
            <span className="small font-semibold">Updating dark store data...</span>
          </div>
        )}

        {/* TAB 1: ORDER PACKING DESK */}
        {!warehouseOrdersLoading && portalTab === "packing" && (
          <div className="row g-4 animate-fade-in">
            {/* Order Packing Queue List */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h4 className="fw-extrabold text-dark mb-0">Incoming Orders Packing Queue</h4>
                  <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1.5 font-bold">
                    ⏱ Target: Pack in 90s
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr className="small text-muted font-bold">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3">Timestamp</th>
                        <th className="py-3">Address Pin</th>
                        <th className="py-3 text-end">Bill Amount</th>
                        <th className="py-3 text-end px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {paginatedPendingOrders.map(o => (
                        <tr key={o.order_id} className="wh-order-row">
                          <td className="px-3 fw-black text-dark">#{o.order_id}</td>
                          <td className="text-muted">
                            {new Date(o.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-2 py-1 font-bold">
                              {o.shipping_pincode || "Serviced"}
                            </span>
                          </td>
                          <td className="text-end fw-extrabold text-slate-800">₹{o.total_amount}</td>
                          <td className="text-end px-3">
                            <button
                              onClick={() => handleOpenPackingChecklist(o)}
                              className="btn btn-yellow btn-sm rounded-pill font-bold py-1.5 px-3"
                              style={{ fontSize: "11px" }}
                            >
                              Start Packing
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pendingPackingOrders.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-5">
                            <div className="py-4">
                              <PackageCheck size={48} className="text-slate-300 mb-3" />
                              <p className="mb-0 font-bold">All orders packed! Standing by for new orders...</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <span className="text-muted text-xs">
                      Showing {startIndex + 1}-{Math.min(startIndex + ordersPerPage, pendingPackingOrders.length)} of {pendingPackingOrders.length} orders
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        disabled={packingPage === 1}
                        onClick={() => setPackingPage(prev => Math.max(prev - 1, 1))}
                        className="btn btn-outline-secondary btn-xs rounded-pill px-3 py-1 font-bold"
                        style={{ fontSize: "11px", opacity: packingPage === 1 ? 0.5 : 1 }}
                      >
                        Previous
                      </button>
                      <span className="text-dark font-bold align-self-center px-1 text-xs">
                        Page {packingPage} of {totalPages}
                      </span>
                      <button
                        disabled={packingPage === totalPages}
                        onClick={() => setPackingPage(prev => Math.min(prev + 1, totalPages))}
                        className="btn btn-outline-secondary btn-xs rounded-pill px-3 py-1 font-bold"
                        style={{ fontSize: "11px", opacity: packingPage === totalPages ? 0.5 : 1 }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Packing Checklist */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
                {packingOrder ? (
                  <div className="d-flex flex-col h-100 justify-content-between">
                    <div>
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3 border-bottom border-light pb-3">
                        <div>
                          <h4 className="fw-black text-dark mb-1">Packing Order #{packingOrder.order_id}</h4>
                          <div className="text-muted text-xs mb-1">
                            <strong>Customer:</strong> {packingOrder.name} ({packingOrder.email})
                          </div>
                          {packingOrder.address_line1 && (
                            <div className="text-secondary text-xs mt-2 p-2 bg-light rounded-3 border">
                              <span className="font-bold text-dark d-block mb-0.5">📍 Shipping Address:</span>
                              {packingOrder.address_line1}
                              {packingOrder.address_line2 ? `, ${packingOrder.address_line2}` : ""}, {packingOrder.city}, {packingOrder.state} - <strong>{packingOrder.shipping_pincode}</strong>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setPackingOrder(null)}
                          className="btn btn-sm btn-secondary p-1 rounded-circle"
                        >
                          &times;
                        </button>
                      </div>

                      {/* Items Packing Checklist */}
                      {loadingItems ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary gap-2">
                          <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                          <span className="small">Retrieving item checklist...</span>
                        </div>
                      ) : (
                        <div className="packing-checklist-section mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="small text-muted font-bold uppercase">Checklist items ({packingItems.length})</span>
                            <button
                              onClick={handleAutoPackAll}
                              className="btn btn-sm btn-outline-warning rounded-pill py-1 px-3 text-xs"
                            >
                              Auto-Pack All
                            </button>
                          </div>

                          <div className="checklist-items-scroll flex flex-col gap-2 overflow-auto" style={{ maxHeight: "250px" }}>
                            {packingItems.map(item => {
                              const isPacked = packedStatuses[item.id] || false;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleToggleItemPacked(item.id)}
                                  className={`packing-item-card d-flex align-items-center justify-content-between p-2.5 rounded-3 border transition-all cursor-pointer ${isPacked ? "border-success bg-success bg-opacity-5" : "border-light"}`}
                                >
                                  <div className="d-flex align-items-center gap-3">
                                    <div className={`checkbox-circle d-flex align-items-center justify-content-center rounded-circle border ${isPacked ? "bg-success border-success text-white" : "border-slate-300 bg-white"}`} style={{ width: "20px", height: "20px" }}>
                                      {isPacked && <Check size={12} />}
                                    </div>
                                    <div>
                                      <span className={`d-block font-bold text-sm ${isPacked ? "text-success text-decoration-line-through" : "text-dark"}`}>
                                        {item.product_name}
                                      </span>
                                      <span className="text-muted text-xs">Qty: {item.quantity} units</span>
                                    </div>
                                  </div>
                                  <span className="font-extrabold text-sm text-slate-700">₹{item.subtotal}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Packing Progress Bar */}
                          <div className="mt-4 pt-3 border-top border-light">
                            <div className="d-flex justify-content-between text-xs font-bold mb-1">
                              <span className="text-secondary">PACKING PROGRESS</span>
                              <span className="text-success">
                                {Object.values(packedStatuses).filter(Boolean).length} / {packingItems.length} packed
                              </span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: "6px" }}>
                              <div
                                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                style={{ width: `${(Object.values(packedStatuses).filter(Boolean).length / packingItems.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2 pt-3 border-top border-light mt-auto">
                      <button
                        disabled={loadingItems || Object.values(packedStatuses).filter(Boolean).length < packingItems.length}
                        onClick={handleConfirmPacked}
                        className="btn btn-success flex-grow-1 py-2.5 rounded-3 text-sm font-bold text-white d-flex align-items-center justify-content-center gap-1.5"
                      >
                        <Printer size={16} />
                        <span>Print & Mark Packed</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary text-center h-100">
                    <QrCode size={64} className="text-slate-200 mb-3" />
                    <h5 className="font-bold text-slate-400">Order Packing Center</h5>
                    <p className="small text-muted max-w-xs mt-1">Select an order from the incoming queue list to begin the interactive packing process.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIDER DISPATCH DESK */}
        {portalTab === "dispatch" && (
          <div className="row g-4 animate-fade-in">
            {/* Orders ready to be dispatched */}
            <div className="col-12 col-md-6">
              <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
                <h4 className="fw-extrabold text-dark mb-4">Orders Ready to Dispatch</h4>
                <div className="flex flex-col gap-3">
                  {readyDispatchOrders.map(o => (
                    <div key={o.order_id} className="dispatch-order-card border rounded-4 p-3 bg-light bg-opacity-50">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="font-black text-dark">Order #{o.order_id}</span>
                        <span className="badge bg-warning bg-opacity-10 text-warning px-2.5 py-1 rounded-pill text-xs font-bold">
                          Packed & Ready
                        </span>
                      </div>
                      <p className="text-secondary text-xs mb-2 truncate">
                        <strong>Address:</strong> {o.address_line1}{o.address_line2 ? `, ${o.address_line2}` : ""}, {o.city}, {o.state} - {o.shipping_pincode}
                      </p>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light border-opacity-50">
                        <span className="font-extrabold text-slate-800 text-sm">₹{o.total_amount}</span>
                        <button
                          onClick={() => handleOpenDispatchForm(o)}
                          className="btn btn-yellow btn-sm rounded-pill font-bold py-1.5 px-3 text-xs"
                        >
                          🛵 Dispatch Rider
                        </button>
                      </div>
                    </div>
                  ))}
                  {readyDispatchOrders.length === 0 && (
                    <div className="text-center py-5 text-muted">
                      <CheckCircle size={32} className="text-slate-300 mb-2" />
                      <p className="small font-bold mb-0">No orders awaiting riders.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Orders in Transit */}
            <div className="col-12 col-md-6">
              <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
                <h4 className="fw-extrabold text-dark mb-4">Out For Delivery (In Transit)</h4>
                <div className="flex flex-col gap-3">
                  {outForDeliveryOrders.map(o => (
                    <div key={o.order_id} className="dispatch-order-card border border-success border-opacity-20 rounded-4 p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="font-black text-dark">Order #{o.order_id}</span>
                        <span className="badge bg-success bg-opacity-10 text-success px-2.5 py-1 rounded-pill text-xs font-bold">
                          In Transit
                        </span>
                      </div>
                      <div className="bg-light rounded-3 p-2 mb-3">
                        <div className="d-flex align-items-center justify-content-between text-xs mb-1">
                          <span className="text-secondary font-bold">Rider Name:</span>
                          <span className="text-dark font-extrabold">{o.delivery_partner_name || "Assigned"}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between text-xs">
                          <span className="text-secondary font-bold">Rider Phone:</span>
                          <span className="text-dark font-semibold">{o.delivery_partner_phone || "N/A"}</span>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light">
                        <span className="font-extrabold text-slate-800 text-sm">ETA: {o.estimated_delivery_minutes || 10} Mins</span>
                        <button
                          onClick={() => handleMarkDelivered(o.order_id)}
                          className="btn btn-success btn-sm rounded-pill font-bold py-1.5 px-3 text-xs text-white"
                        >
                          Confirm Delivery
                        </button>
                      </div>
                    </div>
                  ))}
                  {outForDeliveryOrders.length === 0 && (
                    <div className="text-center py-5 text-muted">
                      <Truck size={32} className="text-slate-300 mb-2" />
                      <p className="small font-bold mb-0">No orders currently out for delivery.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK CATALOG CONTROLLER */}
        {portalTab === "stock" && (
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white animate-fade-in">
            {/* Header controls */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <h4 className="fw-extrabold text-dark mb-1">Store Stock Adjuster</h4>
                <p className="text-muted text-xs mb-0">Control direct quantities available in real-time inside the dark store</p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="btn btn-warning rounded-pill font-bold px-4 py-2 text-white d-flex align-items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={handleSaveStock}
                  disabled={Object.keys(stockEdits).length === 0}
                  className="btn btn-primary rounded-pill font-bold px-4 py-2 text-white"
                >
                  Save Stock Edits ({Object.keys(stockEdits).length})
                </button>
              </div>
            </div>

            {/* Search and category filters */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-8">
                <div className="input-group border rounded-pill px-3 py-1 bg-light align-items-center">
                  <Search size={16} className="text-muted me-2" />
                  <input
                    type="text"
                    placeholder="Search product catalog by name..."
                    className="form-control border-0 bg-transparent py-1.5"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    style={{ fontSize: "13px", outline: "none", boxShadow: "none" }}
                  />
                </div>
              </div>
              <div className="col-12 col-md-4">
                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="form-select rounded-pill px-3 py-2 border font-bold text-xs"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory Stock Grid table */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted font-bold">
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Price</th>
                    <th className="py-3 text-center">Status Toggle</th>
                    <th className="py-3 text-end px-3">Available Stock Quantity</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {paginatedInventory.map(item => {
                    const localStock = stockEdits[item.product_id] !== undefined
                      ? stockEdits[item.product_id]
                      : item.stock_quantity || 0;
                    const isOutOfStock = localStock === 0;

                    return (
                      <tr key={item.product_id}>
                        <td className="px-3">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-dark">{item.product_name}</span>
                            {isOutOfStock ? (
                              <span className="badge bg-danger bg-opacity-10 text-danger text-xxs rounded-pill">
                                Out of Stock
                              </span>
                            ) : localStock <= 5 ? (
                              <span className="badge bg-warning bg-opacity-10 text-warning text-xxs rounded-pill animate-pulse">
                                Low Stock
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="text-muted">{item.category_name}</td>
                        <td className="fw-bold text-slate-800">₹{item.price}</td>
                        <td className="text-center">
                          <div className="form-check form-switch d-inline-block">
                            <input
                              className="form-check-input custom-switch cursor-pointer"
                              type="checkbox"
                              role="switch"
                              checked={!isOutOfStock}
                              onChange={() => handleToggleStockStatus(item.product_id, localStock)}
                              style={{ width: "42px", height: "20px" }}
                            />
                          </div>
                        </td>
                        <td className="text-end px-3">
                          <div className="d-flex align-items-center justify-content-end gap-1.5">
                            <button
                              onClick={() => handleStockChange(item.product_id, Math.max(0, localStock - 1))}
                              className="btn btn-secondary btn-sm p-1 rounded-3 font-extrabold"
                              style={{ width: "26px", height: "26px" }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              className="form-control form-control-sm d-inline-block text-end font-bold rounded-3 px-2"
                              value={localStock}
                              onChange={(e) => handleStockChange(item.product_id, parseInt(e.target.value) || 0)}
                              style={{ maxWidth: "60px", border: "1.5px solid #e2e8f0" }}
                            />
                            <button
                              onClick={() => handleStockChange(item.product_id, localStock + 1)}
                              className="btn btn-secondary btn-sm p-1 rounded-3 font-extrabold"
                              style={{ width: "26px", height: "26px" }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">No products found in warehouse inventory matching search filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalStockPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <span className="text-muted text-xs">
                  Showing {stockStartIndex + 1}-{Math.min(stockStartIndex + stockPerPage, filteredInventory.length)} of {filteredInventory.length} products
                </span>
                <div className="d-flex gap-2">
                  <button
                    disabled={stockPage === 1}
                    onClick={() => setStockPage(prev => Math.max(prev - 1, 1))}
                    className="btn btn-outline-secondary btn-xs rounded-pill px-3 py-1 font-bold"
                    style={{ fontSize: "11px", opacity: stockPage === 1 ? 0.5 : 1 }}
                  >
                    Previous
                  </button>
                  <span className="text-dark font-bold align-self-center px-1 text-xs">
                    Page {stockPage} of {totalStockPages}
                  </span>
                  <button
                    disabled={stockPage === totalStockPages}
                    onClick={() => setStockPage(prev => Math.min(prev + 1, totalStockPages))}
                    className="btn btn-outline-secondary btn-xs rounded-pill px-3 py-1 font-bold"
                    style={{ fontSize: "11px", opacity: stockPage === totalStockPages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DELIVERY PINCODES */}
        {portalTab === "pincodes" && selectedAdminWH && (
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white animate-fade-in">
            <div className="mb-4">
              <h4 className="fw-extrabold text-dark mb-1">Served Pincode Links</h4>
              <p className="text-muted text-xs">Only customers residing in these pincodes will be served by {selectedAdminWH.name}.</p>
            </div>

            <div className="d-flex flex-wrap gap-2.5 mb-4 p-3 bg-light rounded-4">
              {adminPincodes.length === 0 ? (
                <span className="text-muted small italic p-2">No postal codes mapped to this dark store.</span>
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

            {/* Add Pincode Link Form */}
            <div className="border-top pt-4">
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
          </div>
        )}
      </div>

      {/* DISPATCH RIDER OVERLAY SHIELD */}
      {dispatchOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="bg-white rounded-4 p-4 shadow-lg border w-100" style={{ maxWidth: "450px" }}>
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Truck className="text-warning" size={20} /> Dispatch Assignment
            </h4>
            <p className="text-muted small mb-2">Set delivery details for Order #{dispatchOrder.order_id}</p>
            <div className="bg-light rounded-3 p-2 border mb-3 text-xs text-secondary">
              <div className="mb-1 text-dark">
                <strong>Customer:</strong> {dispatchOrder.name} ({dispatchOrder.email})
              </div>
              <div>
                <strong>Address:</strong> {dispatchOrder.address_line1}
                {dispatchOrder.address_line2 ? `, ${dispatchOrder.address_line2}` : ""}, {dispatchOrder.city}, {dispatchOrder.state} - {dispatchOrder.shipping_pincode}
              </div>
            </div>

            <form onSubmit={handleDispatchOrder}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Rider Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control rounded-3"
                  placeholder="e.g. Vikram Singh"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Rider Contact Number</label>
                <input
                  type="text"
                  required
                  className="form-control rounded-3"
                  placeholder="e.g. 9876543210"
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Estimated Delivery (Minutes)</label>
                <input
                  type="number"
                  required
                  className="form-control rounded-3"
                  placeholder="e.g. 10"
                  value={riderEta}
                  onChange={(e) => setRiderEta(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary rounded-3 flex-grow-1">Dispatch Rider</button>
                <button
                  type="button"
                  onClick={() => setDispatchOrder(null)}
                  className="btn btn-outline-secondary rounded-3 flex-grow-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM PRODUCT OVERLAY MODAL */}
      {showAddProductModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="bg-white rounded-4 p-4 shadow-lg border w-100 overflow-auto text-dark" style={{ maxWidth: "500px", maxHeight: "90vh" }}>
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Plus className="text-warning" size={20} /> Add Product to Store
            </h4>
            <p className="text-muted small mb-3">Add a new product and category specific to this store (Pincodes: {adminPincodes.map(p => p.pincode).join(", ") || "None"}).</p>

            <form onSubmit={handleAddProductSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Product Name</label>
                <input
                  type="text"
                  required
                  className="form-control rounded-3"
                  placeholder="e.g. Gurugram Special Samosa"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold d-flex justify-content-between align-items-center">
                  <span>Category</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                    className="btn btn-link p-0 text-decoration-none text-xs fw-bold text-warning"
                  >
                    {isCreatingNewCategory ? "Select Existing Category" : "+ Create New Category"}
                  </button>
                </label>

                {isCreatingNewCategory ? (
                  <div className="p-3 bg-light rounded-3 border mb-2 animate-fade-in">
                    <div className="mb-2">
                      <label className="form-label text-xs fw-semibold text-secondary">New Category Name</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm rounded-2"
                        placeholder="e.g. Local Fast Food"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs fw-semibold text-secondary">Description</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-2"
                        placeholder="e.g. Traditional hot snacks"
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <select
                    className="form-select rounded-3"
                    required
                    value={newProdCategoryId}
                    onChange={(e) => setNewProdCategoryId(e.target.value)}
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label small fw-bold">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="form-control rounded-3"
                    placeholder="25.00"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                  />
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label small fw-bold">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-control rounded-3"
                    placeholder="10"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Product Description</label>
                <textarea
                  className="form-control rounded-3"
                  rows="2"
                  placeholder="Freshly prepared hot samosa served with mint chutney..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Image URL / File Name (Optional)</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. samosa.png"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-warning text-white rounded-3 flex-grow-1 font-bold">Add Product</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setIsCreatingNewCategory(false);
                  }}
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
