
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../tools/CartContext';
import { useCurrency } from '../tools/CurrencyContext';
import CartItem from '../components/CartItem';
import { FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import '../styles/pages/cart.scss';

function Cart() {
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shipping = totalPrice > 50 ? 0 : 5.99;
  const tax = totalPrice * 0.1; // 10% tax
  const grandTotal = totalPrice + shipping + tax;
  
  return (
    <div className="cart-page">
      
      {/* EN-TÊTE */}
      <section className="cart-header">
        <div className="header-content">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </section>
      
      {/* CONTENU */}
      <section className="cart-content">
        <div className="cart-container">
          
          {cartItems.length === 0 ? (
            // Panier vide
            <div className="empty-cart">
              <FaShoppingBag className="empty-icon" />
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
              <Link to="/shop" className="btn-shop">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* ZONE PRINCIPALE - Items */}
              <div className="cart-items">
                <div className="cart-items-header">
                  <h2>Cart Items</h2>
                  <button className="btn-clear" onClick={clearCart}>
                    Clear Cart
                  </button>
                </div>
                
                <div className="items-list">
                  {cartItems.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
                
                <Link to="/shop" className="btn-continue">
                  <FaArrowLeft /> Continue Shopping
                </Link>
              </div>
              
              {/* RÉSUMÉ - Sticky */}
              <div className="cart-summary">
                <h2 className="summary-title">Order Summary</h2>
                
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal ({totalItems} items):</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="free-shipping">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Tax (10%):</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span className="total-price">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                
                {totalPrice < 50 && (
                  <div className="shipping-notice">
                    Add {formatPrice(50 - totalPrice)} more for free shipping!
                  </div>
                )}
                
                {/* ✅ BOUTON CHECKOUT CORRIGÉ - Link vers /checkout */}
                <Link to="/checkout" className="btn-checkout">
                  Proceed to Checkout
                </Link>
                
                <div className="payment-methods">
                  <p>We accept:</p>
                  <div className="payment-icons">
                    <span>💳</span>
                    <span>🔒</span>
                    <span>✓</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
        </div>
      </section>
      
    </div>
  );
}

export default Cart;