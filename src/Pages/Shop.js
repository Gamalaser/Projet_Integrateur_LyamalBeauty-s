// ========================================
// SHOP.JS - PAGE BOUTIQUE
// VERSION CORRIGÉE : API + DEVISES + CTA CENTRÉ ✅
// ========================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../tools/CartContext';
import { getProducts } from '../tools/apiService';
import '../styles/pages/shop.scss';

function Shop() {
  const { getTotalItems } = useCart();
  
  // États
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  
  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    if (categoryFilter === 'All') return true;
    return product.category === categoryFilter;
  });
  
  // Trier les produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  
  // Obtenir les catégories uniques
  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  // Afficher spinner pendant le chargement
  if (loading) {
    return (
      <div className="shop-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Afficher erreur si problème
  if (error) {
    return (
      <div className="shop-page">
        <div className="error-container">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="shop-page">
      
      {/* EN-TÊTE */}
      <section className="shop-header">
        <div className="header-content">
          <h1 className="page-title">Our Shop</h1>
          <p className="page-subtitle">
            Browse our selection of professional beauty products
          </p>
          
          {/* Panier flottant */}
          <Link to="/cart" className="cart-icon-link">
            <FaShoppingCart className="cart-icon" />
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </Link>
        </div>
      </section>
      
      {/* FILTRES ET TRI */}
      <section className="shop-filters">
        <div className="filters-container">
          
          {/* Filtres par catégorie */}
          <div className="filter-group">
            <label>Category:</label>
            <div className="category-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${categoryFilter === category ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tri */}
          <div className="filter-group">
            <label htmlFor="sort">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </div>
          
        </div>
      </section>
      
      {/* RÉSULTATS */}
      <section className="shop-results">
        <div className="results-info">
          <p className="results-count">
            Showing <span className="highlight">{sortedProducts.length}</span> product{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Grille de produits */}
        <div className="products-grid">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* Aucun résultat */}
        {sortedProducts.length === 0 && (
          <div className="no-results">
            <h3>No products found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
        
      </section>
      
      {/* CTA */}
      <section className="shop-cta">
        <div className="cta-content">
          <h2 className="cta-title">Need help choosing?</h2>
          <p className="cta-text">Our experts are here to recommend the best products for your needs</p>
          <Link to="/team" className="btn-cta">Consult Our Stylists</Link>
        </div>
      </section>
      
    </div>
  );
}

export default Shop;