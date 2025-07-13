const Recipe = require("../models/Recipe");

const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addRecipe = async (req, res) => {
  const { title, ingredients, instructions, image } = req.body;
  try {
    const newRecipe = new Recipe({ title, ingredients, instructions, image });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getRecipes, addRecipe, deleteRecipe };
