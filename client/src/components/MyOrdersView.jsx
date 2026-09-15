import React, { useState, useEffect } from 'react';

const MyOrdersView = ({ user, recipes = [], onOpenAuth, onTrackOrder, onSelectRecipe, onAddNewRecipe }) => {
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:5000');

  const [activeSubTab, setActiveSubTab] = useState('placed'); // 'placed', 'received', 'my-dishes'
  const [placedOrders, setPlacedOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = () => {
    if (!user) {
      setPlacedOrders([]);
      setReceivedOrders([]);
      return;
    }

    setLoading(true);

    // Fetch Placed Orders
    const p1 = fetch(`${API_BASE}/api/orders?userId=${encodeURIComponent(user.id)}&userEmail=${encodeURIComponent(user.email)}&type=placed`)
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);

    // Fetch Received Sales Orders
    const p2 = fetch(`${API_BASE}/api/orders?chefEmail=${encodeURIComponent(user.email)}&type=received`)
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);

    Promise.all([p1, p2]).then(([placed, received]) => {
      setPlacedOrders(placed);
      setReceivedOrders(received);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, API_BASE]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!user) {
    return (
      <div className="my-orders-view">
        <div className="empty-state auth-required-state">
          <span className="empty-icon">🔒</span>
          <h3>Log In to Access Your Chef Dashboard</h3>
          <p>Sign in to view your placed food orders, incoming sales, and published recipes.</p>
          <button className="btn-primary" onClick={onOpenAuth}>
            🔑 Log In / Register Now
          </button>
        </div>
      </div>
    );
  }

  const myRecipes = recipes.filter(
    (r) => (r.chefEmail && r.chefEmail.toLowerCase() === user.email.toLowerCase()) || r.chefId === user.id
  );

  return (
    <div className="my-orders-view">
      <div className="dashboard-header">
        <div className="chef-info-banner">
          <div className="avatar-circle">
            <span>{user.name ? user.name.charAt(0).toUpperCase() : '👨‍🍳'}</span>
          </div>
          <div>
            <h2>👨‍🍳 Chef {user.name}'s Profile & Dashboard</h2>
            <p className="chef-email">📧 {user.email} {user.phone ? `| 📱 ${user.phone}` : ''}</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeSubTab === 'placed' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('placed')}
          >
            🛍️ My Placed Orders ({placedOrders.length})
          </button>
          <button
            className={`dashboard-tab ${activeSubTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('received')}
          >
            👩‍🍳 Received Sales Orders ({receivedOrders.length})
          </button>
          <button
            className={`dashboard-tab ${activeSubTab === 'my-dishes' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('my-dishes')}
          >
            🍲 My Published Recipes ({myRecipes.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading your profile dashboard...</div>
      ) : activeSubTab === 'placed' ? (
        /* --- PLACED ORDERS SUBTAB --- */
        <div className="orders-section">
          <div className="section-header">
            <h3>🛍️ Orders You Purchased</h3>
            <span className="count-tag">{placedOrders.length} Orders</span>
          </div>

          {placedOrders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🛵</span>
              <h3>No orders placed yet</h3>
              <p>Explore recipes made by other home chefs and order a delicious meal!</p>
            </div>
          ) : (
            <div className="orders-list">
              {placedOrders.map((ord) => (
                <div key={ord._id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">ORDER #{ord._id}</span>
                      <span className="order-date">
                        {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={`status-pill ${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="order-card-items">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="order-item-chip">
                        <span className="qty">{item.quantity}x</span>
                        <span className="name">{item.title}</span>
                        <span className="chef-sub">({item.chefName || 'Home Chef'})</span>
                        <span className="price">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="delivery-addr">📍 {ord.address}</div>
                    <div className="order-price-box">
                      <span className="pay-method">{ord.paymentMethod}</span>
                      <span className="total">₹{ord.totalAmount}</span>
                      <button className="btn-track" onClick={() => onTrackOrder(ord)}>
                        Track Order 🛵
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === 'received' ? (
        /* --- RECEIVED SALES ORDERS SUBTAB --- */
        <div className="orders-section">
          <div className="section-header">
            <h3>👩‍🍳 Customer Orders Received for Your Dishes</h3>
            <span className="count-tag">{receivedOrders.length} Customer Orders</span>
          </div>

          {receivedOrders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍳</span>
              <h3>No customer orders received yet</h3>
              <p>When foodies order your homemade recipes, their orders will appear here!</p>
            </div>
          ) : (
            <div className="orders-list">
              {receivedOrders.map((ord) => (
                <div key={ord._id} className="order-card seller-order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">SALES ORDER #{ord._id}</span>
                      <span className="order-customer">👤 Customer: {ord.userName} ({ord.phone})</span>
                    </div>
                    <span className={`status-pill ${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="order-card-items">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="order-item-chip">
                        <span className="qty">{item.quantity}x</span>
                        <span className="name">{item.title}</span>
                        <span className="price">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="delivery-info-box">
                    <p>📍 <strong>Deliver To:</strong> {ord.address}</p>
                    <p>💳 <strong>Payment Method:</strong> {ord.paymentMethod} (Earned ₹{ord.totalAmount})</p>
                  </div>

                  <div className="seller-status-actions">
                    <span>Update Delivery Status:</span>
                    <div className="status-btn-group">
                      {['Preparing in Kitchen', 'Out for Delivery', 'Delivered'].map((statusOpt) => (
                        <button
                          key={statusOpt}
                          className={`btn-status-opt ${ord.status === statusOpt ? 'active' : ''}`}
                          disabled={updatingOrderId === ord._id}
                          onClick={() => handleUpdateOrderStatus(ord._id, statusOpt)}
                        >
                          {statusOpt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* --- MY PUBLISHED RECIPES SUBTAB --- */
        <div className="orders-section">
          <div className="section-header">
            <h3>🍲 Dishes You Offer for Sale</h3>
            <button className="btn-primary btn-add-mini" onClick={onAddNewRecipe}>
              + Offer New Dish
            </button>
          </div>

          {myRecipes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📖</span>
              <h3>You haven't published any recipes yet</h3>
              <p>Share what you cook best at home and start accepting orders from hungry foodies!</p>
              <button className="btn-primary" onClick={onAddNewRecipe}>
                ✨ Add Your First Dish
              </button>
            </div>
          ) : (
            <div className="my-recipes-grid">
              {myRecipes.map((r) => (
                <div key={r._id} className="my-recipe-row-card" onClick={() => onSelectRecipe(r)}>
                  <div className="row-card-img">
                    <img
                      src={r.image ? (r.image.startsWith('http') ? r.image : `${API_BASE}/uploads/${r.image}`) : ''}
                      alt={r.title}
                    />
                  </div>
                  <div className="row-card-info">
                    <h4>{r.title}</h4>
                    <p>🏷️ {r.category} | 🌶️ {r.taste}</p>
                    <span className="rating-tag">⭐ {r.rating || '5.0'} ({r.reviews ? r.reviews.length : 1} ratings)</span>
                  </div>
                  <div className="row-card-action">
                    <span className="price">₹{r.price}</span>
                    <button className="btn-secondary">View / Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrdersView;
