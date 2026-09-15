import React from 'react';

const Sidebar = ({ isOpen, onClose, onMenuClick, activeTab = 'all', favoritesCount = 0, cartCount = 0, ordersCount = 0, user, onOpenAuth }) => {
  const handleItemClick = (tab) => {
    onMenuClick(tab);
    if (onClose) onClose();
  };

  const handleProfileClick = () => {
    onOpenAuth();
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-header-row">
            <span className="brand-icon">🍳</span>
            <div className="brand-title">
              <h2>Foodiee</h2>
              <span className="brand-tagline">Recipe Studio & Delivery</span>
            </div>
          </div>
          {onClose && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close Sidebar">
              ✕
            </button>
          )}
        </div>

        <nav className="nav-menu">
          <ul>
            <li
              className={activeTab === 'all' ? 'active' : ''}
              onClick={() => handleItemClick('all')}
            >
              <span className="nav-icon">📖</span>
              <span className="nav-text">Explore Recipes</span>
            </li>

            <li
              className={activeTab === 'favorites' ? 'active' : ''}
              onClick={() => handleItemClick('favorites')}
            >
              <span className="nav-icon">⭐</span>
              <span className="nav-text">Favorites</span>
              {favoritesCount > 0 && (
                <span className="badge-count">{favoritesCount}</span>
              )}
            </li>

            <li
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => handleItemClick('orders')}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">My Hub / Orders</span>
              {ordersCount > 0 && (
                <span className="badge-count badge-orders">{ordersCount}</span>
              )}
            </li>

            <li
              className={activeTab === 'add' ? 'active' : ''}
              onClick={() => handleItemClick('add')}
            >
              <span className="nav-icon">➕</span>
              <span className="nav-text">Add Recipe</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-profile-card" onClick={handleProfileClick}>
          <div className="profile-icon-box">
            {user ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="profile-text">
            <span className="profile-name">{user ? user.name : 'Sign In / Register'}</span>
            <span className="profile-sub">{user ? user.email : 'Click to log in'}</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>© Foodiee Marketplace</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
