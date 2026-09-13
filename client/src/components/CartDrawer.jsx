import React from 'react';

const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, onCheckout }) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + taxes;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Your Food Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-cart-icon">🍲</span>
            <h3>Your cart is empty</h3>
            <p>Explore our delicious recipes and add your favorite dishes!</p>
            <button className="btn-primary" onClick={onClose}>
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                    alt={item.title}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                    }}
                  />
                  <div className="cart-item-info">
                    <h4>{item.title}</h4>
                    <span className="cart-item-price">₹{item.price}</span>
                  </div>

                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>

                  <button className="remove-item-btn" onClick={() => removeFromCart(item._id)}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}</span>
              </div>
              <div className="summary-row">
                <span>GST & Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span className="grand-total-price">₹{grandTotal}</span>
              </div>

              <button className="btn-checkout" onClick={onCheckout}>
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
