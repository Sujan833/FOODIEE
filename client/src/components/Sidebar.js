// src/components/Sidebar.js
import React from 'react';
import logo from '../assets/logo.png'; // Add a food logo image to assets folder

const Sidebar = ({ onMenuClick }) => {
  return (
    <div className="sidebar">
      <img src={logo} alt="Logo" style={{ width: '100%', marginBottom: '20px', borderRadius: '10px' }} />
      <h2>Foodiee 🍴</h2>
      <ul>
        <li onClick={() => onMenuClick('all')}>All Recipes</li>
        <li onClick={() => onMenuClick('add')}>Add New</li>
        <li onClick={() => onMenuClick('favorites')}>Favorites</li>
      </ul>
    </div>
  );
};

export default Sidebar;
