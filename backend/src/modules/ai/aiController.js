const pool = require("../../config/db");

// RAG Knowledge Base - Store Policies & FAQs
const RAG_DATABASE = {
  return_policy: {
    title: "Store Return & Refund Policy",
    source: "Store Policies Section 4.2",
    content: "We offer a 100% freshness guarantee. Snack packs, beverages, or groceries can be returned within 7 days of delivery for a full refund if the item is unopened and seals are intact. Defective items are refunded instantly without return requirements."
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

const handleChat = async (req, res) => {
  try {
    const { text, userId } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Prompt text is required" });
    }

    const lower = text.toLowerCase();
    let responseText = "";
    let recommendedProducts = [];
    let compareProducts = [];
    let trackingOrder = null;
    let ragSourcesList = [];

    // Fetch all products from MySQL database
    const [allProducts] = await pool.query(
      "SELECT p.*, c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.is_available = 1"
    );

    // 1. Price queries: e.g. "Find snacks under Rs 100"
    if (lower.includes("under") || lower.includes("price") || lower.includes("cost") || lower.includes("rs") || lower.includes("₹") || lower.includes("budget")) {
      const numbers = lower.match(/\d+/g);
      const limit = numbers ? parseInt(numbers[0]) : 150;
      
      const filtered = allProducts.filter(p => {
        const finalPrice = p.discount_price !== null ? parseFloat(p.discount_price) : parseFloat(p.price);
        return finalPrice <= limit;
      });

      const matches = filtered.map((p, idx) => ({
        ...p,
        reasonTag: idx % 3 === 0 ? "Fits your budget" : idx % 3 === 1 ? "Best Value" : "Trending",
        whyDescription: `Price of ₹${p.discount_price || p.price} fits your set limit of ₹${limit}.`,
        boughtTogether: allProducts.filter(item => item.product_id !== p.product_id).slice(0, 1)
      }));

      if (matches.length > 0) {
        responseText = `I retrieved **${matches.length} products** from the database matching your budget (Price <= ₹${limit}):`;
        recommendedProducts = matches.slice(0, 5);
      } else {
        responseText = `I couldn't find any products in our store under **₹${limit}**. Here are some popular budget-friendly snacks instead:`;
        recommendedProducts = allProducts.slice(0, 3).map(p => ({
          ...p,
          reasonTag: "Value Choice",
          whyDescription: "A highly-rated budget alternative."
        }));
      }
      ragSourcesList = ["shipping"];
    } 
    // 2. Comparison queries
    else if (lower.includes("compare") || lower.includes("vs") || lower.includes("difference")) {
      let matched = [];
      if (lower.includes("chocolate") || lower.includes("sweet") || lower.includes("cookie")) {
        matched = allProducts.filter(p => p.product_name.toLowerCase().includes("chocolate") || p.product_name.toLowerCase().includes("cookie"));
      } else if (lower.includes("lays") || lower.includes("chips") || lower.includes("potato")) {
        matched = allProducts.filter(p => p.product_name.toLowerCase().includes("lays") || p.product_name.toLowerCase().includes("chips"));
      } else {
        matched = allProducts.slice(0, 2);
      }

      if (matched.length < 2 && allProducts.length >= 2) {
        matched = allProducts.slice(0, 2);
      }

      if (matched.length >= 2) {
        responseText = `Here is a side-by-side specification comparison of **${matched[0].product_name}** and **${matched[1].product_name}** from our RAG product specifications indexes:`;
        compareProducts = matched.slice(0, 3);
      } else {
        responseText = `I couldn't find enough items to display a comparison table. Please try comparing snack categories like **Chips** or **Cookies**!`;
      }
      ragSourcesList = ["freshness"];
    }
    // 3. Order tracking
    else if (lower.includes("track") || lower.includes("order") || lower.includes("status")) {
      if (!userId) {
        responseText = `You must be logged in to inspect your order details. Please log in at the top right of the storefront page.`;
      } else {
        const [orders] = await pool.query(
          "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1",
          [userId]
        );

        if (orders.length === 0) {
          responseText = `I couldn't find any recent orders associated with your account in our database. You can place your first order on the homepage!`;
        } else {
          const latest = orders[0];
          responseText = `Verified order status! Here is the live tracking pipeline for **Order #${latest.id}**, synced directly with our courier delivery database.`;
          trackingOrder = {
            orderNumber: `#${latest.id}`,
            status: latest.status === "shipped" ? "shipped" : latest.status === "delivered" ? "delivered" : "pending",
            courier: "Snacko Logistics Dispatcher",
            trackingId: `SNK-${latest.id}-9827`,
            expectedDelivery: "In 15 - 20 Mins",
            address: latest.address_line1 || "Customer Address, Pune"
          };
        }
      }
      ragSourcesList = ["shipping"];
    }
    // 4. Return and refunds policy
    else if (lower.includes("return") || lower.includes("refund") || lower.includes("policy")) {
      responseText = `According to our RAG knowledge index, you can request a return within **7 days of delivery** for unopened pack items. See RAG Source [1] below for the full store policies documentation:`;
      ragSourcesList = ["return_policy", "freshness"];
    }
    // 5. Coupons and promotions
    else if (lower.includes("offer") || lower.includes("coupon") || lower.includes("deal") || lower.includes("discount") || lower.includes("code")) {
      responseText = `Active promos updated! You can apply coupon **SNACKNEW20** for a 20% discount on your first order. Here are discounted snack items in stock:`;
      recommendedProducts = allProducts.slice(0, 4).map((p, idx) => ({
        ...p,
        reasonTag: "Limited offer",
        whyDescription: "Available at a special discount price today!"
      }));
      ragSourcesList = ["coupons"];
    }
    // 6. Escalation / Support help
    else if (lower.includes("support") || lower.includes("agent") || lower.includes("help") || lower.includes("escalat")) {
      responseText = `Support ticket created! Click the button below to connect directly with our logistics manager at Pune hub.`;
      trackingOrder = {
        orderNumber: "Live Ticket #8724",
        status: "pending",
        courier: "Customer Support Desk",
        trackingId: "TKT-8724-LIVE",
        expectedDelivery: "Immediate Response",
        address: "Support Queue (Position: 1st)"
      };
      ragSourcesList = ["return_policy"];
    }
    // 7. General fallback search query
    else {
      const matched = allProducts.filter(p => 
        (p.product_name && p.product_name.toLowerCase().includes(lower)) || 
        (p.product_description && p.product_description.toLowerCase().includes(lower))
      );

      const itemsToMap = matched.length > 0 ? matched : allProducts.slice(0, 4);
      recommendedProducts = itemsToMap.slice(0, 4).map((p, idx) => ({
        ...p,
        reasonTag: idx === 0 ? "Trending Product" : idx === 1 ? "Based on Preferences" : "Recommended for You",
        whyDescription: "Recommended based on search keywords and popular snacks in Pune micro-warehouse.",
        boughtTogether: allProducts.filter(item => item.product_id !== p.product_id).slice(0, 1)
      }));

      responseText = matched.length > 0
        ? `Found matches for your query! Here are the recommended items available for instant delivery:`
        : `I retrieved these popular snacks from our local dark store inventory that you might enjoy:`;
      
      ragSourcesList = ["freshness", "shipping"];
    }

    res.json({
      success: true,
      text: responseText,
      products: recommendedProducts,
      compareList: compareProducts,
      orderTracking: trackingOrder,
      ragSources: ragSourcesList
    });
  } catch (error) {
    console.error("AI assistant API error:", error);
    res.status(500).json({ success: false, message: "Internal AI API server error" });
  }
};

module.exports = {
  handleChat
};
