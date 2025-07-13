import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import AddRecipeForm from './components/AddRecipeForm';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/recipes')
      .then((res) => res.json())
      .then(setRecipes)
      .catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleRecipeAdded = (newRecipe) => {
    setRecipes([...recipes, newRecipe]);
    setShowAddForm(false);
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipes((prev) =>
      prev.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
    );
    setSelectedRecipe(null);
    setEditMode(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'DELETE',
      });
      setRecipes(recipes.filter((r) => r._id !== id));
      setSelectedRecipe(null);
      setFavorites((prev) => prev.filter((fid) => fid !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleEdit = (recipe) => {
    setSelectedRecipe(recipe);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setSelectedRecipe(null);
    setEditMode(false);
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fid) => fid !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleMenuClick = (menuItem) => {
    if (menuItem === 'add') {
      setSelectedRecipe(null);
      setEditMode(false);
      setShowAddForm(true);
      setShowFavorites(false);
    } else if (menuItem === 'favorites') {
      setSelectedRecipe(null);
      setShowAddForm(false);
      setShowFavorites(true);
    } else {
      setSelectedRecipe(null);
      setShowAddForm(false);
      setShowFavorites(false);
    }
  };

  const displayedRecipes = showFavorites
    ? recipes.filter((r) => favorites.includes(r._id))
    : recipes;

  return (
    <div className="app-layout">
      <Sidebar onMenuClick={handleMenuClick} />
      <div className="content">
        {!selectedRecipe && !showAddForm && !showFavorites && (
          <h1 className="welcome-text">🍽️ Welcome to Foodiee - Explore and Share Recipes! 🍳</h1>
        )}

        {selectedRecipe ? (
          editMode ? (
            <AddRecipeForm
              editMode
              existingRecipe={selectedRecipe}
              onRecipeAdded={handleRecipeUpdated}
              onCancel={handleCancelEdit}
            />
          ) : (
            <RecipeDetail
              recipe={selectedRecipe}
              onBack={() => setSelectedRecipe(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        ) : showAddForm ? (
          <AddRecipeForm onRecipeAdded={handleRecipeAdded} />
        ) : (
          <RecipeList
            recipes={displayedRecipes}
            onSelect={setSelectedRecipe}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
      </div>
    </div>
  );
}

export default App;
