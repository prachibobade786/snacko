import React from "react";
import { Plus, Minus } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./ProductCard.css";

export default function ProductCard({ product, cartItem, addToCart, updateCartQuantity }) {
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const { setSelectedProduct, setMode } = useApp();

  const handleViewDetails = () => {
    setSelectedProduct(product);
    setMode("product-details");
  };

  // Database-driven discount price logic
  const hasDiscount = product.discount_price !== null && parseFloat(product.discount_price) < parseFloat(product.price);
  const isBogo = product.product_id % 5 === 0;
  const activePrice = hasDiscount ? parseFloat(product.discount_price) : parseFloat(product.price);
  const originalPrice = hasDiscount ? parseFloat(product.price) : null;
  const discountPercent = hasDiscount ? Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100) : 0;
  const estDeliveryTime = `${8 + (product.product_id % 5)} min`;

  return (
    <div className="product-card">
      {/* Dynamic badges */}
      <span className="badge-time">{estDeliveryTime}</span>
      
      {isBogo ? (
        <span className="badge-off">Buy 1 Get 1</span>
      ) : hasDiscount ? (
        <span className="badge-off">{discountPercent}% off</span>
      ) : null}

      {/* Stock status tag */}
      {product.stock_quantity <= 0 ? (
        <span className="stock-tag out-of-stock">Out of Stock</span>
      ) : isLowStock ? (
        <span className="stock-tag low-stock">Only {product.stock_quantity} left</span>
      ) : null}

      <div className="product-image-container cursor-pointer" onClick={handleViewDetails}>
        {product.product_image ? (
          <img 
            src={product.product_image.startsWith("http://") || product.product_image.startsWith("https://") ? product.product_image : `/${product.product_image}`} 
            alt={product.product_name} 
            className="w-full h-full" 
            style={{ maxHeight: "80px", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.style.display = 'none';
              const emojiMap = {
                "Coca Cola 250ml": "🥤",
                "Orange Juice 1L": "🍊",
                "Potato Chips Classic Salted": "🥔",
                "Chocolate Cookies": "🍪",
                "Organic Whole Milk 1L": "🥛",
                "Sourdough Bread 400g": "🍞"
              };
              const emoji = emojiMap[product.product_name] || "🍎";
              e.target.parentNode.innerHTML = `<span class="product-image-placeholder">${emoji}</span>`;
            }}
          />
        ) : (
          <span className="product-image-placeholder">🍎</span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between" style={{ marginTop: "8px" }}>
        <div className="cursor-pointer" onClick={handleViewDetails}>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{product.category_name}</span>
          <h4 className="product-name mt-0.5 line-clamp-2" style={{ height: "38px" }}>{product.product_name}</h4>
          <p className="product-meta line-clamp-1">{product.product_description || "1 pack"}</p>
        </div>

        <div className="product-foot">
          <span className="price">
            Rs {activePrice}
            {originalPrice && <small>Rs {originalPrice}</small>}
          </span>
          
          {product.stock_quantity <= 0 ? (
            <button disabled className="btn btn-secondary !py-1 !px-3 text-xs cursor-not-allowed" style={{ height: "30px", borderRadius: "15px" }}>
              Out
            </button>
          ) : cartItem ? (
            <div className="card-quantity-adjuster">
              <button 
                onClick={() => updateCartQuantity(product.product_id, -1)}
                className="card-quantity-btn"
              >
                <Minus size={10} />
              </button>
              <span className="card-quantity-val">{cartItem.quantity}</span>
              <button 
                onClick={() => updateCartQuantity(product.product_id, 1)}
                className="card-quantity-btn"
                disabled={cartItem.quantity >= 4}
                title={cartItem.quantity >= 4 ? "Maximum 4 units allowed" : ""}
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(product)}
              className="add-btn"
              aria-label={`Add ${product.product_name} to cart`}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
