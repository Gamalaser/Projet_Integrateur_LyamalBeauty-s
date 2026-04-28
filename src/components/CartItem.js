// Ici nous avons ajouté l'import de useCurrency pour formater les prix, 
// et nous avons modifié les affichages de prix pour utiliser cette fonction de formatage. 
// Nous avons également supprimé le .toFixed(2) car la fonction de formatage gère déjà l'affichage des décimales.
import React from 'react';
import { useCart } from '../tools/CartContext';
import { useCurrency } from '../tools/CurrencyContext'; // ✅ AJOUTÉ
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import '../styles/components/cartitem.scss';

function CartItem({ item }) {
  const { incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency(); // ✅ AJOUTÉ
  
  const totalPrice = item.price * item.quantity; // ✅ MODIFIÉ (supprimé .toFixed(2))
  
  return (
    <div className="cart-item-component">
      <div 
        className="cart-item-image" 
        style={{backgroundImage: `url(${item.image})`}}
      />
      
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <p className="cart-item-category">{item.category}</p>
        <span className="cart-item-price">{formatPrice(item.price)}</span> {/* ✅ MODIFIÉ */}
      </div>
      
      <div className="cart-item-actions">
        <div className="quantity-controls">
          <button 
            className="btn-quantity"
            onClick={() => decrementQuantity(item.id)}
            aria-label="Decrease quantity"
          >
            <FaMinus />
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button 
            className="btn-quantity"
            onClick={() => incrementQuantity(item.id)}
            aria-label="Increase quantity"
          >
            <FaPlus />
          </button>
        </div>
        
        <div className="item-total">
          <span className="total-label">Total:</span>
          <span className="total-value">{formatPrice(totalPrice)}</span> {/* ✅ MODIFIÉ */}
        </div>
        
        <button 
          className="btn-remove"
          onClick={() => removeFromCart(item.id)}
          aria-label="Remove from cart"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default CartItem;