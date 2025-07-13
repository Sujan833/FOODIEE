// components/AddRecipeForm.js
import React, { useState } from 'react';
import axios from 'axios';

const AddRecipeForm = ({ onRecipeAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    taste: '',
    ingredients: '',
    rating: '',
    price: '',
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/recipes', data);
      onRecipeAdded(res.data);
      setFormData({
        title: '',
        category: '',
        taste: '',
        ingredients: '',
        rating: '',
        price: '',
      });
      setImageFile(null);
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
      <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
      <input name="taste" placeholder="Taste (e.g., Spicy)" value={formData.taste} onChange={handleChange} required />
      <input name="ingredients" placeholder="Ingredients (comma separated)" value={formData.ingredients} onChange={handleChange} required />
      <input name="rating" type="number" placeholder="Rating" value={formData.rating} onChange={handleChange} required />
      <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit">Add Recipe</button>
    </form>
  );
};

export default AddRecipeForm;
