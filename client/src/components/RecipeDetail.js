// src/components/RecipeDetail.js
import React, { useState } from 'react';
import defaultImage from '../assets/default.jpg';
import './RecipeDetail.css';
import axios from 'axios';

const RecipeDetail = ({ recipe, onBack }) => {
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState({ ...recipe });
  const [file, setFile] = useState(null);

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

      const res = await axios.put(
        `http://localhost:5000/api/recipes/${recipe._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // After successful update
      setEditing(false);
      onBack(); // trigger view update
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/recipes/${recipe._id}`);
      onBack();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="recipe-detail">
      <button className="back-btn" onClick={onBack}>← Back</button>
      {editing ? (
        <>
          <input name="title" value={edited.title} onChange={handleChange} />
          <input name="category" value={edited.category} onChange={handleChange} />
          <input name="taste" value={edited.taste} onChange={handleChange} />
          <input name="ingredients" value={edited.ingredients} onChange={handleChange} />
          <input name="rating" type="number" value={edited.rating} onChange={handleChange} />
          <input name="price" type="number" value={edited.price} onChange={handleChange} />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <br />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <img
            src={recipe.image ? `http://localhost:5000/uploads/${recipe.image}` : defaultImage}
            alt={recipe.title}
            className="detail-img"
          />
          <h2>{recipe.title}</h2>
          <p><strong>Category:</strong> {recipe.category}</p>
          <p><strong>Taste:</strong> {recipe.taste}</p>
          <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
          <p><strong>Rating:</strong> {recipe.rating}</p>
          <p><strong>Price:</strong> ₹{recipe.price}</p>
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={handleDelete} style={{ backgroundColor: 'red' }}>Delete</button>
        </>
      )}
    </div>
  );
};

export default RecipeDetail;
