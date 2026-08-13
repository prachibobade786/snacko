import { useState } from 'react';
import { getCategories as fetchCategoriesApi, getProducts as fetchProductsApi } from '../services/api';

export function useCatalog(apiBase) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await fetchCategoriesApi(apiBase);
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.log('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (currPincode = null) => {
    setLoadingProducts(true);
    try {
      const data = await fetchProductsApi(apiBase, currPincode);
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.log('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return {
    categories,
    setCategories,
    products,
    setProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loadingProducts,
    fetchCategories,
    fetchProducts,
    filteredProducts,
  };
}
