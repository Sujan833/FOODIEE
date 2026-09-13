import React from 'react';
import logo from '../assets/logo.png';

const Sidebar = ({ onMenuClick, activeTab = 'all', favoritesCount = 0, cartCount = 0, ordersCount = 0, user, onOpenAuth }) => {
  return (
    <aside className="sidebar">
      <div className="brand-section">
        {logo ? (
          <img src={logo} alt="Foodiee Logo" className="brand-logo" />
        ) : (
          <span className="brand-icon">🍳</span>
        )}
        <div className="brand-title">
          <h2>Foodiee</h2>
          <span className="brand-tagline">Recipe Studio & Delivery</span>
        </div>
      </div>

      <nav className="nav-menu">
        <ul>
          <li
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => onMenuClick('all')}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-text">Explore Recipes</span>
          </li>

          <li
            className={activeTab === 'favorites' ? 'active' : ''}
            onClick={() => onMenuClick('favorites')}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Favorites</span>
            {favoritesCount > 0 && (
              <span className="badge-count">{favoritesCount}</span>
            )}
          </li>

          <li
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => onMenuClick('orders')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">My Hub / Orders</span>
            {ordersCount > 0 && (
              <span className="badge-count badge-orders">{ordersCount}</span>
            )}
          </li>

          <li
            className={activeTab === 'add' ? 'active' : ''}
            onClick={() => onMenuClick('add')}
          >
            <span className="nav-icon">➕</span>
            <span className="nav-text">Add Recipe</span>
          </li>
        </ul>
      </nav>

      <div className="sidebar-profile-card" onClick={onOpenAuth}>
        <div className="profile-icon-box">
          {user ? user.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div className="profile-text">
          <span className="profile-name">{user ? user.name : 'Sign In / Register'}</span>
          <span className="profile-sub">{user ? user.email : 'Click to log in'}</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <p>💡 Hot-reloading active</p>
      </div>
    </aside>
  );
};

export default Sidebar;
