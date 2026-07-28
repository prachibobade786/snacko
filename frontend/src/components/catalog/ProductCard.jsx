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

  return (
    <div className="product-card">
      {/* Stock status tag */}
      {product.stock_quantity <= 0 ? (
        <span className="stock-tag out-of-stock">Out of Stock</span>
      ) : isLowStock ? (
        <span className="stock-tag low-stock">Only {product.stock_quantity} left</span>
      ) : (
        <span className="stock-tag in-stock">Available ({product.stock_quantity} units)</span>
      )}

      <div className="product-image-container cursor-pointer" onClick={handleViewDetails}>
        {product.product_image ? (
          <img 
            src={product.product_image.startsWith("http://") || product.product_image.startsWith("https://") ? product.product_image : `/${product.product_image}`} 
            alt={product.product_name} 
            className="w-full h-full" 
            style={{ maxHeight: "100px", objectFit: "contain" }}
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

      <div className="flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={handleViewDetails}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category_name}</span>
          <h4 className="font-bold text-sm text-slate-800 leading-snug mt-0.5 line-clamp-2">{product.product_name}</h4>
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">{product.product_description || "Fresh & local"}</p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="font-extrabold text-slate-900">₹{product.price}</span>
          
          {product.stock_quantity <= 0 ? (
            <button disabled className="btn btn-secondary !py-1 !px-3 text-xs cursor-not-allowed">
              Unavailable
            </button>
          ) : cartItem ? (
            <div className="card-quantity-adjuster">
              <button 
                onClick={() => updateCartQuantity(product.product_id, -1)}
                className="card-quantity-btn"
              >
                <Minus size={12} />
              </button>
              <span className="card-quantity-val">{cartItem.quantity}</span>
              <button 
                onClick={() => updateCartQuantity(product.product_id, 1)}
                className="card-quantity-btn"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(product)}
              className="btn btn-outline !py-1 !px-3 text-xs"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
