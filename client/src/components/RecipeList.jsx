import React from 'react';
import RecipeCard from './RecipeCard';

const RecipeList = ({ recipes, onSelect, favorites, toggleFavorite, onAddToCart, cart = [] }) => {
  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          onSelect={onSelect}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onAddToCart={onAddToCart}
          cartItem={cart.find((c) => c._id === recipe._id)}
        />
      ))}
    </div>
  );
};

export default RecipeList;
