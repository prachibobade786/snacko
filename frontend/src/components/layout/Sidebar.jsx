import React from "react";
import "./Sidebar.css";

export default function Sidebar({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <aside className="sidebar-categories flex flex-col gap-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Categories</h3>
      <div 
        className={`category-item ${selectedCategory === null ? "active" : ""}`}
        onClick={() => setSelectedCategory(null)}
      >
        All Products
      </div>
      {categories.map(cat => (
        <div 
          key={cat.category_id}
          className={`category-item ${selectedCategory === cat.category_id ? "active" : ""}`}
          onClick={() => setSelectedCategory(cat.category_id)}
        >
          {cat.category_name}
        </div>
      ))}
    </aside>
  );
}
