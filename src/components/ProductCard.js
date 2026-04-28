
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../tools/CartContext';
import { useCurrency } from '../tools/CurrencyContext'; // ici nous avons importé le hook useCurrency pour formater les prix selon la devise sélectionnée par l'utilisateur.
import { FaShoppingCart } from 'react-icons/fa';
import '../styles/components/productcard.scss';

function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const { formatPrice } = useCurrency(); // ici nous avons utilisé le hook useCurrency pour obtenir la fonction formatPrice, que nous avons utilisée pour afficher les prix des produits de manière formatée et adaptée à la devise sélectionnée par l'utilisateur.
  
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