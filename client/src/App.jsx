import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import AddRecipeForm from './components/AddRecipeForm';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import MyOrdersView from './components/MyOrdersView';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('foodiee_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('foodiee_cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    if (!user) return [];
    const stored = localStorage.getItem(`foodiee_favs_${user.email}`);
    return stored ? JSON.parse(stored) : [];
  });

  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:5000');

  const fetchRecipes = () => {
    fetch(`${API_BASE}/api/recipes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRecipes(data);
      })
      .catch((err) => console.error('Failed to fetch recipes:', err));
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (user && user.email) {
      const stored = localStorage.getItem(`foodiee_favs_${user.email}`);
      setFavorites(stored ? JSON.parse(stored) : []);
    } else {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`foodiee_favs_${user.email}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  useEffect(() => {
    localStorage.setItem('foodiee_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('foodiee_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('foodiee_user');
    }
  }, [user]);

  const addToCart = (recipe) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === recipe._id);
      if (existing) {
        return prevCart.map((item) =>
          item._id === recipe._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...recipe, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item._id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const handleRecipeAdded = () => {
    fetchRecipes();
    setActiveTab('all');
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
      await fetch(`${API_BASE}/api/recipes/${id}`, { method: 'DELETE' });
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      setSelectedRecipe(null);
      setFavorites((prev) => prev.filter((fid) => fid !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const toggleFavorite = (id) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fid) => fid !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleMenuClick = (tab) => {
    setSelectedRecipe(null);
    setEditMode(false);
    if ((tab === 'favorites' || tab === 'orders') && !user) {
      setIsAuthOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleOrderPlaced = (newOrder) => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTrackedOrder(newOrder);
  };

  const handleLogout = () => {
    setUser(null);
    setFavorites([]);
    setCart([]);
    localStorage.removeItem('foodiee_user');
    localStorage.removeItem('foodiee_cart');
    setIsAuthOpen(false);
    setActiveTab('all');
    setSelectedRecipe(null);
  };

  const categories = ['All', ...new Set(recipes.map((r) => r.category).filter(Boolean))];

  const displayedRecipes = recipes.filter((r) => {
    const matchesFavorites = activeTab === 'favorites' ? favorites.includes(r._id) : true;
    const matchesCategory =
      selectedCategory === 'All' ||
      (r.category && r.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.taste?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFavorites && matchesCategory && matchesSearch;
  });

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuClick={handleMenuClick}
        activeTab={activeTab}
        favoritesCount={favorites.length}
        cartCount={totalCartCount}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="content">
        <header className="top-bar">
          <button
            className="menu-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Navigation Menu"
          >
            ☰
          </button>

          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search recipes, ingredients, or taste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>

          <div className="header-actions">
            <button className="btn-cart-header" onClick={() => setIsCartOpen(true)}>
              🛒 Cart ({totalCartCount})
            </button>
            <button className="btn-add-quick" onClick={() => handleMenuClick('add')}>
              + Add Recipe
            </button>
          </div>
        </header>

        {!selectedRecipe && activeTab !== 'add' && activeTab !== 'orders' && (
          <div className="category-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {selectedRecipe ? (
          editMode ? (
            <AddRecipeForm
              user={user}
              editMode
              existingRecipe={selectedRecipe}
              onRecipeAdded={handleRecipeUpdated}
              onCancel={() => {
                setSelectedRecipe(null);
                setEditMode(false);
              }}
            />
          ) : (
            <RecipeDetail
              recipe={selectedRecipe}
              user={user}
              onOpenAuth={() => setIsAuthOpen(true)}
              onBack={() => setSelectedRecipe(null)}
              onEdit={(recipe) => {
                setSelectedRecipe(recipe);
                setEditMode(true);
              }}
              onDelete={handleDelete}
              onAddToCart={addToCart}
              cartItem={cart.find((c) => c._id === selectedRecipe._id)}
            />
          )
        ) : activeTab === 'add' ? (
          <AddRecipeForm user={user} onRecipeAdded={handleRecipeAdded} />
        ) : activeTab === 'orders' ? (
          <MyOrdersView
            user={user}
            recipes={recipes}
            onOpenAuth={() => setIsAuthOpen(true)}
            onTrackOrder={(ord) => setActiveTrackedOrder(ord)}
            onSelectRecipe={(r) => {
              setSelectedRecipe(r);
              setActiveTab('all');
            }}
            onAddNewRecipe={() => setActiveTab('add')}
          />
        ) : (
          <div className="recipes-view">
            <div className="section-header">
              <h2>
                {activeTab === 'favorites'
                  ? '⭐ Favorite Recipes'
                  : selectedCategory !== 'All'
                  ? `🍲 ${selectedCategory} Recipes`
                  : '🍽️ All Delicious Recipes'}
              </h2>
              <span className="count-tag">{displayedRecipes.length} dishes available</span>
            </div>

            {displayedRecipes.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🍳</span>
                <h3>No recipes match your filter</h3>
                <p>Try clearing your search or adding a new delicious recipe!</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setActiveTab('all');
                  }}
                >
                  Explore All Dishes
                </button>
              </div>
            ) : (
              <RecipeList
                recipes={displayedRecipes}
                onSelect={setSelectedRecipe}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
                cart={cart}
              />
            )}
          </div>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        user={user}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrderTrackerModal
        order={activeTrackedOrder}
        onClose={() => setActiveTrackedOrder(null)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setIsAuthOpen(false);
        }}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
