// components/RecipeCard.js
import React from 'react';
import defaultImage from '../assets/default.jpg';

const RecipeCard = ({ recipe, onSelect, favorites = [], toggleFavorite }) => {
  const imageUrl = recipe.image
    ? `http://localhost:5000/uploads/${recipe.image}`
    : defaultImage;

  const isFavorite = favorites.includes(recipe._id);

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <img src={imageUrl} alt={recipe.title} />
      <h4>{recipe.title}</h4>
      <div
        style={{ cursor: 'pointer', fontSize: '18px' }}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(recipe._id);
        }}
      >
        {isFavorite ? '⭐' : '☆'}
      </div>
    </div>
  );
};

export default RecipeCard;
