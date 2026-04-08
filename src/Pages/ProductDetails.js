// ========================================
// PRODUCT DETAILS - DÉTAILS D'UN PRODUIT
// VERSION CORRIGÉE : API + DEVISES ✅
// ========================================
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../tools/CartContext';
import { useCurrency } from '../tools/CurrencyContext'; // ✅ AJOUTÉ
import { getProductById } from '../tools/apiService';
import { FaStar, FaShoppingCart, FaCheck, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import '../styles/pages/productdetails.scss';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, isInCart } = useCart();
  const { formatPrice } = useCurrency(); // ✅ AJOUTÉ
  
  // États
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Charger le produit depuis l'API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Afficher spinner pendant le chargement
  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // Afficher erreur si produit introuvable
  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>Sorry, the product you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn-back">Back to Shop</Link>
        </div>
      </div>
    );
  }
  
  // Générer des images de fallback si le produit n'a pas de galerie
  const productImages = product.images || [
    product.image,
    product.image,
    product.image
  ];
  
  // Générer des features de fallback
  const productFeatures = product.features || [
    "Premium quality",
    "Professional grade",
    "Suitable for all types",
    "Long-lasting results"
  ];
  
  // Générer rating de fallback
  const productRating = product.rating || 4.5;
  const productReviews = product.reviewsCount || 0;
  
  return (
    <div className="product-details-page">
      
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/shop"><FaArrowLeft /> Back to Shop</Link>
      </div>
      
      {/* CONTENU PRINCIPAL */}
      <div className="product-container">
        
        {/* GALERIE IMAGES */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={productImages[selectedImage]} alt={product.name} />
          </div>
          <div className="thumbnail-list">
            {productImages.map((img, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`${product.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
        
        {/* INFORMATIONS PRODUIT */}
        <div className="product-info">
          
          <span className="product-category">{product.category}</span>
          
          <h1 className="product-name">{product.name}</h1>
          
          {/* Rating */}
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < Math.floor(productRating) ? 'filled' : ''}
                />
              ))}
            </div>
            <span className="rating-text">
              {productRating.toFixed(1)} {productReviews > 0 && `(${productReviews} reviews)`}
            </span>
          </div>
          
          {/* Prix */}
          <div className="product-price">
            <span className="price">{formatPrice(product.price)}</span> {/* ✅ MODIFIÉ */}
            {product.stock < 10 && product.stock > 0 && (
              <span className="stock-warning">Only {product.stock} left!</span>
            )}
            {product.stock === 0 && (
              <span className="stock-warning out">Out of Stock</span>
            )}
          </div>
          
          {/* Description */}
          <p className="product-description">{product.description}</p>
          
          {/* Features */}
          <div className="product-features">
            <h3>Key Features:</h3>
            <ul>
              {productFeatures.map((feature, index) => (
                <li key={index}>
                  <FaCheck /> {feature}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quantité et Panier */}
          <div className="purchase-section">
            <div className="quantity-selector">
              <span className="quantity-label">Quantity:</span>
              <div className="quantity-controls">
                <button onClick={decrementQuantity} disabled={quantity <= 1}>
                  <FaMinus />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button onClick={incrementQuantity} disabled={quantity >= product.stock || product.stock === 0}>
                  <FaPlus />
                </button>
              </div>
            </div>
            
            <button 
              className={`btn-add-to-cart ${isInCart(product.id) ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FaShoppingCart />
              {product.stock === 0 ? 'Out of Stock' : isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
          
        </div>
        
      </div>
      
      {/* DÉTAILS SUPPLÉMENTAIRES */}
      <div className="product-details">
        
        <div className="details-tabs">
          <div className="tab active">Description</div>
          <div className="tab">Details</div>
        </div>
        
        <div className="details-content">
          <div className="details-section">
            <h3>About This Product</h3>
            <p>{product.description}</p>
            <br />
            <p>This premium {product.category.toLowerCase()} product is designed for professional use and delivers exceptional results. Perfect for those who demand quality and performance.</p>
          </div>
          
          <div className="details-section">
            <h3>Product Details</h3>
            <ul>
              <li><strong>Category:</strong> {product.category}</li>
              <li><strong>Price:</strong> {formatPrice(product.price)}</li> {/* ✅ MODIFIÉ */}
              <li><strong>Availability:</strong> {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</li>
              <li><strong>Product ID:</strong> #{product.id}</li>
            </ul>
          </div>
        </div>
        
      </div>
      
    </div>
  );
}

export default ProductDetails;