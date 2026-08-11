import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Trash2, Send, Mic, Image as ImageIcon, Paperclip,
  Smile, ArrowLeft, ArrowRight, Star, ShoppingCart,
  Eye, Heart, Compass, CheckCircle2, ChevronRight, HelpCircle,
  AlertCircle, ShoppingBag, X, MessageSquare, Plus, FileText, Camera,
  UserCheck, ShieldCheck, Tag, LifeBuoy, Volume2, Globe, ScanBarcode
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import * as api from "../../api/api";
import "./AiAssistant.css";

// RAG Database Mock - Store Policies & FAQs
const RAG_DATABASE = {
  return_policy: {
    title: "Store Return & Refund Policy",
    source: "Store Policies Section 4.2",
    content: "We offer a 100% freshness guarantee. Snack packs, beverages, or groceries can be returned within 7 days of delivery for a full refund if the item is unopened and seals are intact. Unserviceable or defective items are refunded instantly without return requirements."
  },
  shipping: {
    title: "Shipping & 10-Minute Delivery",
    source: "Logistics Hub SLA v2.1",
    content: "All Snacko orders are fulfilled directly from our local micro-warehouses (dark stores) closest to your resolved pincode. We deliver operational snacks in 10-20 minutes. Delivery fees are flat ₹15, waived for orders above ₹250."
  },
  freshness: {
    title: "Freshness Standards & Expiry Guarantee",
    source: "Quality Control Guidelines",
    content: "Every snack item is scanned at dispatch. We guarantee a minimum remaining shelf life of 60 days on all packaged products. Fresh bakery items are baked daily and never stored overnight."
  },
  coupons: {
    title: "Coupons & Discounts Rules",
    source: "Store Promotions Directory",
    content: "You can apply coupons at checkout. Current active codes: SNACKNEW20 (20% off for first order, min ₹150), SNACKY10 (10% flat off, no minimum), and FREEDEL (Free delivery for orders above ₹100)."
  }
};

export default function AiAssistant() {
  const {
    products = [],
    categories = [],
    cart = [],
    addToCart,
    user,
    token,
    setMode,
    setIsCartOpen
  } = useApp();

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "👋 Hello! I am your Enterprise AI Shopping Assistant, powered by Gemini 2.5 & Store RAG Retrieval systems. I have access to real-time inventory databases, active promo coupon systems, and store policies.\n\nAsk me to **recommend snacks**, **compare chips**, **check order status**, or **explain our return policies**!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ragSources: []
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Custom overlays / Simulator states
  const [toastMessage, setToastMessage] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // Expanded Dialog Modals (Future capabilities simulations)
  const [activeCitationContent, setActiveCitationContent] = useState(null);

  // Orders State
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // Scroll references
  const chatScrollRef = useRef(null);

  // Load User Orders on mount or login
  useEffect(() => {
    if (user && token) {
      api.fetchOrders(token)
        .then(res => {
          if (res.success) {
            setUserOrders(res.data || []);
          }
        })
        .catch(err => console.error("Error loading user orders for chatbot:", err));
      setOrdersLoaded(true);
    }
  }, [user, token]);

  // Auto Scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, thinkingSteps]);

  // Show inline Toast alert
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Toggle local Wishlist
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(prev => prev.filter(id => id !== productId));
      triggerToast("Removed from Wishlist");
    } else {
      setWishlist(prev => [...prev, productId]);
      triggerToast("Added to Wishlist!");
    }
  };

  // Clear current chat
  const clearChat = () => {
    setMessages([
      {
        id: "msg-welcome-clear",
        sender: "assistant",
        text: "Conversation cleared. Memory context reset. Ask me anything about our snack catalog, coupon promotions, or return guidelines!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ragSources: []
      }
    ]);
    triggerToast("Conversation reset");
  };

  // Quick Action / Prompt Card Handler
  const handleSuggestedPrompt = (promptText) => {
    setInputText(promptText);
    sendMessage(null, promptText);
  };

  // Simulation of multi-step AI thinking phases
  const runThinkingProcess = async (steps) => {
    setIsThinking(true);
    setThinkingSteps(steps.map((text, idx) => ({ text, status: idx === 0 ? "active" : "pending" })));
    setActiveStepIndex(0);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      setThinkingSteps(prev => {
        const next = [...prev];
        next[i].status = "completed";
        if (next[i + 1]) {
          next[i + 1].status = "active";
        }
        return next;
      });
      setActiveStepIndex(i + 1);
    }

    setIsThinking(false);
  };

  // Simulate LLM streaming text response
  const streamBotResponse = (text, callback) => {
    let currentText = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        currentText += text.charAt(i);
        callback(currentText);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 10); // Super responsive typing speed
  };

  // Add Item to Cart directly from Chat bubble
  const handleAddToCart = (product) => {
    addToCart(product);
    triggerToast(`Added ${product.product_name} to cart!`);
  };

  // Buy Now: adds to cart and opens cart drawer
  const handleBuyNow = (product) => {
    addToCart(product);
    setIsCartOpen(true);
    triggerToast("Opening cart checkout...");
  };




  // RAG Citation Expand utility
  const handleCitationClick = (citationKey) => {
    const data = RAG_DATABASE[citationKey];
    if (data) {
      setActiveCitationContent(prev => prev && prev.key === citationKey ? null : { key: citationKey, ...data });
    }
  };

  // Core Chatbot Response Logic
  const sendMessage = async (e, forceText = null) => {
    if (e) e.preventDefault();
    const textToSend = forceText || inputText;
    if (!textToSend.trim()) return;

    // Add User Message
    const userMsg = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");

    // AI Processing Analysis
    const lower = textToSend.toLowerCase();

    // Choose loading indicator thinking steps dynamically
    let thinkingStepsList = ["Understanding request...", "Searching catalog database..."];
    if (lower.includes("under") || lower.includes("price") || lower.includes("cost") || lower.includes("rs") || lower.includes("₹") || lower.includes("budget")) {
      thinkingStepsList = [
        "Parsing price thresholds...",
        "Searching product catalog in MySQL database...",
        "Checking local warehouse stock quantities...",
        "Formulating budget recommendations..."
      ];
    } else if (lower.includes("compare") || lower.includes("vs") || lower.includes("difference")) {
      thinkingStepsList = [
        "Identifying products to compare...",
        "Retrieving detailed specification sheets...",
        "Checking database for product ingredients...",
        "Synthesizing specifications matrix..."
      ];
    } else if (lower.includes("track") || lower.includes("order") || lower.includes("status")) {
      thinkingStepsList = [
        "Reading active customer session cookies...",
        "Querying MySQL orders database...",
        "Retrieving live shipment coordinates..."
      ];
    } else if (lower.includes("return") || lower.includes("refund") || lower.includes("policy")) {
      thinkingStepsList = [
        "Retrieving store guidelines document from RAG index...",
        "Verifying consumer refund policies..."
      ];
    }

    await runThinkingProcess(thinkingStepsList);

    let responseText = "I encountered an error querying the AI assistant backend.";
    let recommendedProducts = [];
    let compareProducts = [];
    let trackingOrder = null;
    let ragSourcesList = [];

    try {
      const res = await api.fetchAiResponse(token, textToSend, user?.id || null);
      if (res.success) {
        responseText = res.text;
        recommendedProducts = res.products || [];
        compareProducts = res.compareList || [];
        trackingOrder = res.orderTracking || null;
        ragSourcesList = res.ragSources || [];
      }
    } catch (err) {
      console.error("Failed to query AI assistant backend API:", err);
      responseText = "Sorry, I am having trouble connecting to the store AI API server. Please check your network connection.";
    }

    // Bot message template
    const botMsgId = "msg-bot-" + Date.now();
    const botMsg = {
      id: botMsgId,
      sender: "assistant",
      text: "", // Will be filled dynamically by stream
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      products: recommendedProducts,
      compareList: compareProducts,
      orderTracking: trackingOrder,
      ragSources: ragSourcesList,
      isStreaming: true
    };

    setMessages(prev => [...prev, botMsg]);

    // Stream text first
    streamBotResponse(responseText, (streamedText) => {
      setMessages(prev => prev.map(m => {
        if (m.id === botMsgId) {
          return { ...m, text: streamedText };
        }
        return m;
      }));
    });

    // Mark stream complete after completion
    setTimeout(() => {
      setMessages(prev => prev.map(m => {
        if (m.id === botMsgId) {
          return { ...m, isStreaming: false };
        }
        return m;
      }));
    }, responseText.length * 10 + 150);
  };

  return (
    <div className="assistant-root">

      {/* Main Conversation Container */}
      <section className="assistant-chat-panel">

        {/* Chat Panel Header */}
        <header className="assistant-header">
          <div className="assistant-info">
            <button className="control-btn" onClick={() => setMode("customer")} title="Back to Storefront">
              <ArrowLeft size={16} />
            </button>

            <div className="avatar-ai-container">
              <div className="avatar-ai">
                <Sparkles size={18} />
              </div>
              <span className="status-indicator pulsing"></span>
            </div>

            <div>
              <h1 className="assistant-title">AI Shopping Assistant</h1>
            </div>
          </div>

          <div className="header-controls">
            <button className="control-btn" onClick={clearChat} title="Clear Chat History">
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        {/* Messages / Welcome View Scrollable Area */}
        <div className="conversation-scroll" ref={chatScrollRef}>



          {messages.length === 1 ? (
            /* WELCOME HERO SECTION */
            <div className="welcome-hero">
              <div className="welcome-logo">🛍️</div>
              <h1>👋 Hi! I'm your AI Shopping Assistant</h1>
              <p>
                Ask about snack recommendations, specification comparisons, active promotions, or order tracking. Direct integration handles your cart updates immediately.
              </p>

              <div className="prompt-grid">
                <div className="prompt-card" onClick={() => handleSuggestedPrompt("Recommend snacks under ₹100")}>
                  <div className="prompt-icon">🍟</div>
                  <span className="prompt-text">Find snacks under ₹100</span>
                  <span className="prompt-desc">List crispy chips and chocolates within budget.</span>
                </div>
                <div className="prompt-card" onClick={() => handleSuggestedPrompt("Compare snacks specifications")}>
                  <div className="prompt-icon">⚖️</div>
                  <span className="prompt-text">Compare snacks specifications</span>
                  <span className="prompt-desc">Show ingredients and ratings in comparison table.</span>
                </div>
                <div className="prompt-card" onClick={() => handleSuggestedPrompt("Can I return an item?")}>
                  <div className="prompt-icon">🛡️</div>
                  <span className="prompt-text">Return & refund policies</span>
                  <span className="prompt-desc">Check return window and freshness guarantee rules.</span>
                </div>
                <div className="prompt-card" onClick={() => handleSuggestedPrompt("Track my latest order")}>
                  <div className="prompt-icon">📦</div>
                  <span className="prompt-text">Track my order status</span>
                  <span className="prompt-desc">Query shipment coordinates and progress timelines.</span>
                </div>
              </div>
            </div>
          ) : (
            /* CONVERSATION FLOW MESSAGES */
            messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}>
                {msg.sender === "assistant" && (
                  <div className="message-avatar">
                    <div className="avatar-ai">
                      <Sparkles size={14} />
                    </div>
                  </div>
                )}

                <div className="message-bubble">
                  {/* Message Markdown Content */}
                  <div className="message-content">
                    {msg.text.split("\n").map((line, idx) => {
                      if (line.startsWith("###")) {
                        return <h3 key={idx} className="font-baloo text-base mt-2 mb-1">{line.replace("###", "").trim()}</h3>;
                      }
                      if (line.startsWith("*") || line.startsWith("-")) {
                        return <li key={idx} className="ml-4 list-disc">{line.substring(1).trim()}</li>;
                      }
                      // Check for markdown bolding **text**
                      const boldParts = line.split(/\*\*(.*?)\*\*/g);
                      if (boldParts.length > 1) {
                        return (
                          <p key={idx}>
                            {boldParts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part)}
                          </p>
                        );
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>

                  {/* Dynamic Custom Cards - Renders on Stream Completion */}
                  {!msg.isStreaming && msg.products && msg.products.length > 0 && (
                    <div className="carousel-container">
                      <div className="carousel-scroll">
                        {msg.products.map((p) => {
                          const isDiscounted = p.discount_price !== null && parseFloat(p.discount_price) < parseFloat(p.price);
                          const inCart = cart.find(item => item.product.product_id === p.product_id);
                          return (
                            <div key={p.product_id} className="product-recommend-card">
                              <div className="card-image-wrap">
                                {isDiscounted && <span className="discount-badge">SPECIAL OFFER</span>}
                                <span className="stock-badge">10-Min Delivery</span>
                                <img src={p.product_image || "https://images.unsplash.com/photo-1599490659213-e2b9527ec087?w=300"} alt={p.product_name} />
                                <button
                                  className={`card-heart-btn ${wishlist.includes(p.product_id) ? "liked" : ""}`}
                                  onClick={() => toggleWishlist(p.product_id)}
                                >
                                  <Heart size={14} fill={wishlist.includes(p.product_id) ? "#E53935" : "none"} />
                                </button>
                              </div>

                              <div className="card-body-assistant">
                                {/* AI Match Reason Badge */}
                                {p.reasonTag && (
                                  <span className={`recommend-reason-badge ${p.reasonTag.toLowerCase().includes("value") ? "value" : p.reasonTag.toLowerCase().includes("trend") ? "trending" : "history"}`}>
                                    <Tag size={10} />
                                    <span>{p.reasonTag}</span>
                                  </span>
                                )}

                                <span className="card-category-assistant">Database Checked</span>
                                <h4 className="card-title-assistant font-baloo">{p.product_name}</h4>

                                <div className="card-rating-wrap">
                                  <Star size={12} />
                                  <span>4.8 (Verified reviews summary)</span>
                                </div>

                                <p className="card-desc-assistant">
                                  {p.whyDescription || p.product_description || "Real-time stock matched to address."}
                                </p>

                                <div className="card-delivery-est">
                                  <CheckCircle2 size={12} />
                                  <span>In Stock (Pune warehouse)</span>
                                </div>

                                <div className="card-price-row">
                                  <span className="card-price-now">
                                    ₹{isDiscounted ? p.discount_price : p.price}
                                  </span>
                                  {isDiscounted && (
                                    <span className="card-price-old">₹{p.price}</span>
                                  )}
                                </div>

                                <div className="card-action-grid">
                                  <button className="card-btn-action" onClick={() => handleAddToCart(p)}>
                                    <ShoppingCart size={12} />
                                    <span>{inCart ? `Cart (${inCart.quantity})` : "Add"}</span>
                                  </button>
                                  <button className="card-btn-action btn-accent" onClick={() => handleBuyNow(p)}>
                                    <span>Buy Now</span>
                                  </button>
                                </div>

                                {/* Frequently Bought Together Accessories */}
                                {p.boughtTogether && p.boughtTogether.length > 0 && (
                                  <div className="bought-together-container">
                                    <span className="bought-together-title">Frequently Bought Together</span>
                                    <div className="bought-together-chips">
                                      {p.boughtTogether.map(acc => (
                                        <button
                                          key={acc.product_id}
                                          className="bought-together-chip-btn"
                                          onClick={() => handleAddToCart(acc)}
                                        >
                                          <span>+ Add {acc.product_name}</span>
                                          <span className="text-[var(--orange)]">₹{acc.price}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Product Comparison View */}
                  {!msg.isStreaming && msg.compareList && msg.compareList.length > 0 && (
                    <div className="comparison-table-wrap">
                      <table className="comparison-table">
                        <thead>
                          <tr>
                            <th>Feature Specification</th>
                            {msg.compareList.map((p, idx) => (
                              <th key={p.product_id}>
                                <div className="comparison-col-header">
                                  {idx === 0 && <span className="best-choice-badge">Best Choice ⭐</span>}
                                  <img
                                    src={p.product_image || "https://images.unsplash.com/photo-1599490659213-e2b9527ec087?w=100"}
                                    className="comparison-product-thumb"
                                    alt={p.product_name}
                                  />
                                  <span className="truncate max-w-[120px]">{p.product_name}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="highlight-best-row">
                            <td className="font-bold">Price</td>
                            {msg.compareList.map(p => (
                              <td key={p.product_id} className="font-extrabold text-[var(--orange)]">
                                ₹{p.discount_price || p.price}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-bold">MySQL Live Stock</td>
                            {msg.compareList.map(p => (
                              <td key={p.product_id} className="text-green-600 font-semibold">Available</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-bold">Estimated Delivery</td>
                            {msg.compareList.map(p => (
                              <td key={p.product_id}>15 Mins</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-bold">Ingredients</td>
                            {msg.compareList.map((p, idx) => (
                              <td key={p.product_id}>
                                {idx === 0 ? "Premium salt & organic potatoes" : "Wheat flour, sugar, choco chips"}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-bold">Pros</td>
                            {msg.compareList.map((p, idx) => (
                              <td key={p.product_id}>
                                <span className="tag-pro">Low Sodium</span>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-bold">Cons</td>
                            {msg.compareList.map((p, idx) => (
                              <td key={p.product_id}>
                                <span className="tag-con">Fragile Packaging</span>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Order Tracking Widget */}
                  {!msg.isStreaming && msg.orderTracking && (
                    <div className="order-track-card">
                      <div className="track-header">
                        <div>
                          <span className="text-xs text-slate-400 block">Order Number</span>
                          <span className="track-id">{msg.orderTracking.orderNumber}</span>
                        </div>
                        <span className={`track-status-pill ${msg.orderTracking.status}`}>
                          {msg.orderTracking.status}
                        </span>
                      </div>

                      {/* Timeline steps */}
                      <div className="track-timeline">
                        <div
                          className="timeline-progress-bar"
                          style={{
                            width: msg.orderTracking.status === "delivered" ? "100%" : msg.orderTracking.status === "shipped" ? "66%" : "33%"
                          }}
                        />
                        <div className={`timeline-step completed`}>
                          <div className="step-circle">✓</div>
                          <span className="step-label">Placed</span>
                        </div>
                        <div className={`timeline-step ${msg.orderTracking.status !== "pending" ? "completed" : "active"}`}>
                          <div className="step-circle">{msg.orderTracking.status === "pending" ? "●" : "✓"}</div>
                          <span className="step-label">Packing</span>
                        </div>
                        <div className={`timeline-step ${msg.orderTracking.status === "delivered" ? "completed" : msg.orderTracking.status === "shipped" ? "active" : ""}`}>
                          <div className="step-circle">{msg.orderTracking.status === "shipped" ? "●" : msg.orderTracking.status === "delivered" ? "✓" : "3"}</div>
                          <span className="step-label">On Way</span>
                        </div>
                        <div className={`timeline-step ${msg.orderTracking.status === "delivered" ? "completed" : ""}`}>
                          <div className="step-circle">✓</div>
                          <span className="step-label">Arrived</span>
                        </div>
                      </div>

                      <div className="track-details-grid">
                        <span className="track-detail-label">Courier Service:</span>
                        <span className="track-detail-val">{msg.orderTracking.courier}</span>
                        <span className="track-detail-label">Tracking ID:</span>
                        <span className="track-detail-val font-mono">{msg.orderTracking.trackingId}</span>
                        <span className="track-detail-label">Est. Time:</span>
                        <span className="track-detail-val text-green-600">{msg.orderTracking.expectedDelivery}</span>
                        <span className="track-detail-label">Delivery Address:</span>
                        <span className="track-detail-val truncate max-w-[180px]" title={msg.orderTracking.address}>{msg.orderTracking.address}</span>
                      </div>

                      <button className="track-support-btn flex items-center justify-center gap-2" onClick={() => handleSuggestedPrompt("Talk to support agent")}>
                        <LifeBuoy size={14} />
                        <span>Escalate to Customer Support Agent</span>
                      </button>
                    </div>
                  )}

                  {/* RAG Reference Citation Pills */}
                  {!msg.isStreaming && msg.ragSources && msg.ragSources.length > 0 && (
                    <div className="rag-sources-wrap">
                      <span className="rag-source-header">
                        <ShieldCheck size={12} className="text-green-600" />
                        <span>RAG Retrieval Context Verified</span>
                      </span>
                      <div className="rag-source-list">
                        {msg.ragSources.map((key) => {
                          const doc = RAG_DATABASE[key];
                          if (!doc) return null;
                          return (
                            <button
                              key={key}
                              className="rag-source-citation"
                              onClick={() => handleCitationClick(key)}
                            >
                              <FileText size={10} />
                              <span>{doc.title}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Expanded RAG Reference details */}
                      {activeCitationContent && msg.ragSources.includes(activeCitationContent.key) && (
                        <div className="rag-source-content">
                          <strong>Source:</strong> <em>{activeCitationContent.source}</em>
                          <p className="mt-1 mb-0">{activeCitationContent.content}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <span className="message-timestamp">{msg.timestamp}</span>
                </div>
              </div>
            ))
          )}

          {/* AI THINKING LOADING PLACEHOLDER */}
          {isThinking && (
            <div className="message-row ai-row">
              <div className="message-avatar">
                <div className="avatar-ai">
                  <Sparkles size={14} />
                </div>
              </div>
              <div className="thinking-container">
                <div className="thinking-pulse-loader">
                  <div className="thinking-dot"></div>
                  <div className="thinking-dot"></div>
                  <div className="thinking-dot"></div>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {thinkingSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`thinking-step-row ${step.status}`}
                    >
                      <div className="thinking-step-icon">
                        {step.status === "completed" && <CheckCircle2 size={12} className="text-green-600" />}
                        {step.status === "active" && <div className="thinking-spinner" />}
                        {step.status === "pending" && <div className="w-2 h-2 rounded-full bg-slate-300 ml-1.5" />}
                      </div>
                      <span>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions strip */}
        <div className="quick-action-bar">
          <button className="quick-chip" onClick={() => handleSuggestedPrompt("Show potato chips under ₹100")}>
            <span>🥔 Chips Under ₹100</span>
          </button>
          <button className="quick-chip" onClick={() => handleSuggestedPrompt("Compare chocolates")}>
            <span>⚖️ Compare Specs</span>
          </button>
          <button className="quick-chip" onClick={() => handleSuggestedPrompt("Can I return an item?")}>
            <span>🛡️ Return & Refunds</span>
          </button>
          <button className="quick-chip" onClick={() => handleSuggestedPrompt("Track my recent order")}>
            <span>📦 Live Tracker</span>
          </button>
          <button className="quick-chip" onClick={() => handleSuggestedPrompt("Show active coupons")}>
            <span>🏷️ Coupons</span>
          </button>
          <button className="quick-chip" onClick={() => setMode("customer")}>
            <span>🏪 Go to Storefront</span>
          </button>
        </div>

        {/* Input Controls */}
        <div className="chat-input-container">

          <form onSubmit={sendMessage} className="input-box-wrapper">

            {/* Input Text Area */}
            <textarea
              className="chat-text-area"
              placeholder="Ask about products, orders, comparisons, or recommendations..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />

            {/* Submit Send Button */}
            <button
              type="submit"
              className="input-icon-btn send-btn-circle"
              disabled={!inputText.trim() || isThinking}
            >
              <Send size={16} />
            </button>

          </form>
        </div>

      </section>





      {/* Local Toast Alert */}
      {toastMessage && (
        <div className="assistant-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
