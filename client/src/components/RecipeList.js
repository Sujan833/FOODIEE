import React from 'react';
import RecipeCard from './RecipeCard';

const RecipeList = ({ recipes, onSelect, favorites, toggleFavorite }) => {
  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          onSelect={onSelect}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
};

export default RecipeList;
