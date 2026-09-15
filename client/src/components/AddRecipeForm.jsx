import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddRecipeForm = ({ user, onRecipeAdded, editMode = false, existingRecipe = null, onCancel }) => {
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:5000');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    taste: '',
    ingredients: '',
    rating: '5.0',
    price: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (editMode && existingRecipe) {
      setFormData({
        title: existingRecipe.title || '',
        category: existingRecipe.category || '',
        taste: existingRecipe.taste || '',
        ingredients: existingRecipe.ingredients || '',
        rating: existingRecipe.rating !== undefined ? existingRecipe.rating : '5.0',
        price: existingRecipe.price !== undefined ? existingRecipe.price : '',
      });
      if (existingRecipe.image) {
        setPreviewUrl(
          existingRecipe.image.startsWith('http')
            ? existingRecipe.image
            : `${API_BASE}/uploads/${existingRecipe.image}`
        );
      }
    }
  }, [editMode, existingRecipe, API_BASE]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (user) {
      data.append('chefName', user.name || 'Home Chef');
      data.append('chefEmail', user.email || '');
      data.append('chefId', user.id || '');
    }

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      let res;
      if (editMode && existingRecipe) {
        res = await axios.put(`${API_BASE}/api/recipes/${existingRecipe._id}`, data);
      } else {
        res = await axios.post(`${API_BASE}/api/recipes`, data);
      }

      onRecipeAdded(res.data);
      if (!editMode) {
        setFormData({
          title: '',
          category: '',
          taste: '',
          ingredients: '',
          rating: '5.0',
          price: '',
        });
        setImageFile(null);
        setPreviewUrl('');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please check backend connection.');
    }
  };

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>{editMode ? '✏️ Edit Recipe' : '✨ Add New Home Recipe'}</h2>
        <p className="form-subtitle">
          {user ? `Posting as 👨‍🍳 Chef ${user.name}` : 'Share your homemade dish to sell on Foodiee'}
        </p>
      </div>
      <form className="add-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipe Title</label>
          <input
            name="title"
            placeholder="e.g., Homemade Creamy Garlic Pasta"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <input
              name="category"
              placeholder="e.g., Italian, Indian, Dessert"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Taste Profile</label>
            <input
              name="taste"
              placeholder="e.g., Spicy, Savory, Sweet"
              value={formData.taste}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Ingredients (comma separated)</label>
          <input
            name="ingredients"
            placeholder="e.g., Fresh dough, San Marzano tomatoes, Garlic"
            value={formData.ingredients}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Initial Rating (1 - 5)</label>
            <input
              name="rating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              placeholder="5.0"
              value={formData.rating}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Selling Price (₹)</label>
            <input
              name="price"
              type="number"
              placeholder="299"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Recipe Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editMode ? 'Save Changes' : '👨‍🍳 Publish & Offer Dish'}
          </button>
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddRecipeForm;
