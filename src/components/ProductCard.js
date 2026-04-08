// ========================================
// PRODUCT CARD - CARTE DE PRODUIT
// VERSION AVEC DEVISES ✅
// ========================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../tools/CartContext';
import { useCurrency } from '../tools/CurrencyContext'; // ✅ AJOUTÉ
import { FaShoppingCart } from 'react-icons/fa';
import '../styles/components/productcard.scss';

function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const { formatPrice } = useCurrency(); // ✅ AJOUTÉ
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };
  
  return (
    <div className="product-card-component">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div 
          className="product-card-image" 
          style={{backgroundImage: `url(${product.image})`}}
        >
          {product.stock < 10 && product.stock > 0 && (
            <span className="stock-badge low">Only {product.stock} left</span>
          )}
          {product.stock === 0 && (
            <span className="stock-badge out">Out of Stock</span>
          )}
        </div>
        
        <div className="product-card-content">
          <span className="product-category">{product.category}</span>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          
          <div className="product-footer">
            <span className="product-price">{formatPrice(product.price)}</span> {/* ✅ MODIFIÉ */}
            <button 
              className={`btn-add-cart ${isInCart(product.id) ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FaShoppingCart />
              {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;