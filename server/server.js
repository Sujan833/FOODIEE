const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const Recipe = require("./models/Recipe");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// GET all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new recipe
app.post('/api/recipes', upload.single('image'), async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      image: req.file ? req.file.filename : '',
    });
    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update recipe
app.put('/api/recipes/:id', upload.single('image'), async (req, res) => {
  try {
    const updatedData = { ...req.body };
    if (req.file) {
      updatedData.image = req.file.filename;
    }
    const updated = await Recipe.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
