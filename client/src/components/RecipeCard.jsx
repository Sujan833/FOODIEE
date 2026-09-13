import React from 'react';
import defaultImage from '../assets/default.jpg';

const RecipeCard = ({ recipe, onSelect, favorites = [], toggleFavorite, onAddToCart, cartItem }) => {
  const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SERVER_URL) || (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || 'http://localhost:5000';

  const imageUrl = recipe.image
    ? (recipe.image.startsWith('http') ? recipe.image : `${API_BASE}/uploads/${recipe.image}`)
    : defaultImage;

  const isFavorite = favorites.includes(recipe._id);
  const chefDisplay = recipe.chefName || 'Home Chef';
  const reviewsCount = recipe.reviews ? recipe.reviews.length : (recipe.ratingsCount || 0);

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <div className="card-image-container">
        <img
          src={imageUrl}
          alt={recipe.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(recipe._id);
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>
        {recipe.category && <span className="category-badge">{recipe.category}</span>}
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <h4 className="recipe-title">{recipe.title}</h4>
          {recipe.rating && (
            <span className="rating-badge">
              ⭐ {recipe.rating} {reviewsCount > 0 ? `(${reviewsCount})` : ''}
            </span>
          )}
        </div>

        <div className="chef-badge-row">
          <span className="chef-badge">👨‍🍳 By {chefDisplay}</span>
          {recipe.taste && <span className="taste-tag">🌶️ {recipe.taste}</span>}
        </div>

        <div className="card-footer">
          <span className="price-tag">₹{recipe.price}</span>
          <button
            className="btn-add-cart-card"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(recipe);
            }}
          >
            {cartItem ? `🛒 in Cart (${cartItem.quantity})` : '🛒 Add to Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
