
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';

import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../tools/CartContext';
import { getProducts } from '../tools/apiService';
import '../styles/pages/shop.scss';

function Shop() {
  const { t } = useTranslation();
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
        setError(t('shop.error.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [t]);
  
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
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Afficher erreur si problème
  if (error) {
    return (
      <div className="shop-page">
        <div className="error-container">
          <h2>{t('shop.error.title')}</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>{t('shop.error.retry')}</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="shop-page">
      
      {/* EN-TÊTE */}
      <section className="shop-header">
        <div className="header-content">
          <h1 className="page-title">{t('shop.title')}</h1>
          <p className="page-subtitle">
            {t('shop.subtitle')}
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
            <label>{t('shop.filters.category')}:</label>
            <div className="category-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${categoryFilter === category ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category === 'All' ? t('shop.filters.allCategories') : category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tri */}
          <div className="filter-group">
            <label htmlFor="sort">{t('shop.filters.sortBy')}:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">{t('shop.filters.sortOptions.nameAZ')}</option>
              <option value="price-low">{t('shop.filters.sortOptions.priceLowHigh')}</option>
              <option value="price-high">{t('shop.filters.sortOptions.priceHighLow')}</option>
            </select>
          </div>
          
        </div>
      </section>
      
      {/* RÉSULTATS */}
      <section className="shop-results">
        <div className="results-info">
          <p className="results-count">
            {t('shop.results.showing')} <span className="highlight">{sortedProducts.length}</span> {sortedProducts.length !== 1 ? t('shop.results.products') : t('shop.results.product')}
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
            <h3>{t('shop.noResults.title')}</h3>
            <p>{t('shop.noResults.message')}</p>
          </div>
        )}
        
      </section>
      
      {/* CTA */}
      <section className="shop-cta">
        <div className="cta-content">
          <h2 className="cta-title">{t('shop.cta.title')}</h2>
          <p className="cta-text">{t('shop.cta.text')}</p>
          <Link to="/team" className="btn-cta">{t('shop.cta.button')}</Link>
        </div>
      </section>
      
    </div>
  );
}

export default Shop;