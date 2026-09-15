import React, { useState, useEffect } from 'react';

const CheckoutModal = ({ isOpen, onClose, cart, user, onOrderPlaced }) => {
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:5000');

  const [deliveryData, setDeliveryData] = useState({
    userName: '',
    phone: '',
    address: '',
    pincode: '',
    notes: '',
    paymentMethod: 'UPI / GPay'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDeliveryData((prev) => ({
        ...prev,
        userName: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        pincode: user.pincode || ''
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 40;
  const taxes = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + deliveryFee + taxes;

  const handleChange = (e) => {
    setDeliveryData({ ...deliveryData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        userId: user ? user.id : 'usr-guest',
        userEmail: user ? user.email : '',
        userName: deliveryData.userName,
        phone: deliveryData.phone,
        address: deliveryData.address,
        pincode: deliveryData.pincode,
        items: cart.map((item) => ({
          id: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          chefName: item.chefName || 'Home Chef',
          chefEmail: item.chefEmail || ''
        })),
        subtotal,
        deliveryFee,
        taxes,
        totalAmount,
        paymentMethod: deliveryData.paymentMethod
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderResult = await res.json();
      setLoading(false);
      onOrderPlaced(orderResult);
    } catch (err) {
      console.error('Order submission error:', err);
      setLoading(false);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>🛵 Delivery & Checkout</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmitOrder} className="checkout-form">
          <div className="form-section">
            <h3>📍 Delivery Address</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="userName"
                  placeholder="e.g. Sujan Kumar"
                  value={deliveryData.userName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={deliveryData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                placeholder="House/Flat No., Street, Landmark, Area"
                rows="2"
                value={deliveryData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pincode</label>
                <input
                  name="pincode"
                  placeholder="560001"
                  value={deliveryData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cooking Notes (Optional)</label>
                <input
                  name="notes"
                  placeholder="e.g., Make it extra spicy / Leave at door"
                  value={deliveryData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>💳 Payment Option</h3>
            <div className="payment-options">
              {['UPI / GPay', 'Cash on Delivery', 'Credit / Debit Card', 'Net Banking'].map((method) => (
                <label
                  key={method}
                  className={`payment-card ${deliveryData.paymentMethod === method ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={deliveryData.paymentMethod === method}
                    onChange={handleChange}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="checkout-order-summary">
            <h3>📋 Order Summary ({cart.length} items)</h3>
            <div className="checkout-item-list">
              {cart.map((item) => (
                <div key={item._id} className="checkout-item-row">
                  <span>{item.quantity}x {item.title}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="checkout-total-banner">
              <span>Total Payable</span>
              <span className="total-highlight">₹{totalAmount}</span>
            </div>
          </div>

          <div className="checkout-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Back to Cart
            </button>
            <button type="submit" className="btn-primary btn-place-order" disabled={loading}>
              {loading ? 'Placing Your Order...' : `Confirm & Place Order (₹${totalAmount})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
