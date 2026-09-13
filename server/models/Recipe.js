const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const recipeSchema = new mongoose.Schema({
  title: String,
  category: String,
  taste: String,
  ingredients: String,
  rating: { type: Number, default: 4.5 },
  ratingsCount: { type: Number, default: 1 },
  price: Number,
  image: String, // stores image filename
  chefName: { type: String, default: "Master Chef" },
  chefEmail: { type: String, default: "" },
  chefId: { type: String, default: "" },
  reviews: [reviewSchema]
});

module.exports = mongoose.model("Recipe", recipeSchema);

