const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: String,
  category: String,
  taste: String,
  ingredients: String,
  rating: Number,
  price: Number,
  image: String, // stores image filename
});

module.exports = mongoose.model("Recipe", recipeSchema);
