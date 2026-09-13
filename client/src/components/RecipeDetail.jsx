import React, { useState } from 'react';
import defaultImage from '../assets/default.jpg';
import './RecipeDetail.css';
import axios from 'axios';

const RecipeDetail = ({ recipe, user, onOpenAuth, onBack, onEdit, onDelete, onAddToCart, cartItem }) => {
  const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SERVER_URL) || (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || 'http://localhost:5000';

  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState({ ...recipe });
  const [file, setFile] = useState(null);

  // Current active recipe state (allows live updates when rating)
  const [activeRecipe, setActiveRecipe] = useState(recipe);

  // Rating Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const handleChange = (e) => {
    setEdited({ ...edited, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      for (let key in edited) {
        formData.append(key, edited[key]);
      }
      if (file) {
        formData.append('image', file);
      }

      const res = await axios.put(`${API_BASE}/api/recipes/${activeRecipe._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setEditing(false);
      setActiveRecipe(res.data);
      if (onEdit) {
        onEdit(res.data);
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to save updates. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${activeRecipe.title}"?`)) return;
    try {
      if (onDelete) {
        await onDelete(activeRecipe._id);
      } else {
        await axios.delete(`${API_BASE}/api/recipes/${activeRecipe._id}`);
        onBack();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete recipe.');
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setSubmittingRating(true);
    setRatingMessage('');

    try {
      const res = await axios.post(`${API_BASE}/api/recipes/${activeRecipe._id}/rate`, {
        userEmail: user.email,
        userName: user.name,
        rating: userRating,
        comment: userComment
      });

      setActiveRecipe(res.data);
      setSubmittingRating(false);
      setRatingMessage('⭐ Thank you for rating this dish!');
      setUserComment('');
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setSubmittingRating(false);
      setRatingMessage('⚠️ Failed to post review. Please try again.');
    }
  };

  const imageUrl = activeRecipe.image
    ? (activeRecipe.image.startsWith('http') ? activeRecipe.image : `${API_BASE}/uploads/${activeRecipe.image}`)
    : defaultImage;

  const ingredientsList = typeof activeRecipe.ingredients === 'string'
    ? activeRecipe.ingredients.split(',').map((item) => item.trim()).filter(Boolean)
    : (Array.isArray(activeRecipe.ingredients) ? activeRecipe.ingredients : []);

  const chefDisplay = activeRecipe.chefName || 'Home Chef';
  const reviewsList = activeRecipe.reviews || [];

  return (
    <div className="recipe-detail-container">
      <button className="back-btn" onClick={onBack}>
        ← Back to Recipes
      </button>

      {editing ? (
        <div className="add-form-container">
          <h2>✏️ Edit "{activeRecipe.title}"</h2>
          <div className="add-form">
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={edited.title || ''} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input name="category" value={edited.category || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Taste</label>
                <input name="taste" value={edited.taste || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Ingredients</label>
              <input name="ingredients" value={edited.ingredients || ''} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹)</label>
                <input name="price" type="number" value={edited.price || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Change Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="detail-card">
          <div className="detail-hero">
            <img
              src={imageUrl}
              alt={activeRecipe.title}
              className="detail-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
            <div className="detail-hero-overlay">
              {activeRecipe.category && <span className="detail-category">{activeRecipe.category}</span>}
              <h1>{activeRecipe.title}</h1>
              <div className="detail-chef-tag">
                <span>👨‍🍳 Prepared by Chef {chefDisplay}</span>
              </div>
            </div>
          </div>

          <div className="detail-body">
            <div className="detail-stats-row">
              <div className="stat-box">
                <span className="stat-label">Overall Rating</span>
                <span className="stat-value">⭐ {activeRecipe.rating || '5.0'} ({reviewsList.length || activeRecipe.ratingsCount || 1})</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Taste Profile</span>
                <span className="stat-value">🌶️ {activeRecipe.taste || 'Classic'}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Selling Price</span>
                <span className="stat-value highlight">₹{activeRecipe.price || 0}</span>
              </div>
            </div>

            <div className="ingredients-section">
              <h3>🥗 Fresh Ingredients</h3>
              {ingredientsList.length > 0 ? (
                <div className="ingredients-grid">
                  {ingredientsList.map((ingredient, i) => (
                    <span key={i} className="ingredient-chip">
                      ✓ {ingredient}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No ingredients specified.</p>
              )}
            </div>

            <div className="detail-order-bar">
              <button className="btn-primary btn-order-now" onClick={() => onAddToCart(activeRecipe)}>
                {cartItem ? `🛒 Add Another (${cartItem.quantity} in Cart)` : `🛒 Order From Chef ${chefDisplay}`}
              </button>
            </div>

            {/* Rating & Review Submission Box */}
            <div className="rating-review-section">
              <h3>⭐ Rate & Review This Recipe</h3>
              {!user ? (
                <div className="rating-auth-prompt">
                  <p>Loved this dish? Log in to leave a star rating and feedback for Chef {chefDisplay}!</p>
                  <button className="btn-secondary" onClick={onOpenAuth}>
                    🔑 Log In to Rate
                  </button>
                </div>
              ) : (
                <form className="rating-form" onSubmit={handleRateSubmit}>
                  {ratingMessage && <div className="rating-msg">{ratingMessage}</div>}
                  <div className="star-picker">
                    <label>Select Rating:</label>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={`star-btn ${star <= userRating ? 'selected' : ''}`}
                          onClick={() => setUserRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Your Review / Feedback</label>
                    <textarea
                      rows="3"
                      placeholder="Share how delicious it tasted or how quick delivery was..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary btn-submit-review" disabled={submittingRating}>
                    {submittingRating ? 'Posting Review...' : 'Post Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="reviews-list-container">
                <h4>💬 Customer Reviews ({reviewsList.length})</h4>
                {reviewsList.length === 0 ? (
                  <p className="no-reviews">Be the first to rate and review Chef {chefDisplay}'s dish!</p>
                ) : (
                  <div className="reviews-list">
                    {reviewsList.map((rev, idx) => (
                      <div key={idx} className="review-card">
                        <div className="review-header">
                          <span className="reviewer-name">👤 {rev.userName || 'Foodie'}</span>
                          <span className="review-stars">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                        </div>
                        <p className="review-comment">"{rev.comment}"</p>
                        {rev.createdAt && (
                          <span className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Owner or Admin Actions */}
            {user && (user.email === activeRecipe.chefEmail || !activeRecipe.chefEmail) && (
              <div className="detail-actions">
                <button className="btn-edit" onClick={() => setEditing(true)}>
                  ✏️ Edit My Dish
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  🗑️ Remove Dish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
