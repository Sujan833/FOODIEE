// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// GET all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new recipe
router.post('/', async (req, res) => {
  try {
    const { title, category, rating, image, taste, price, ingredients } = req.body;
    const newRecipe = new Recipe({
      title,
      category,
      rating,
      image,
      taste,
      price,
      ingredients: ingredients || []
    });

    const saved = await newRecipe.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
