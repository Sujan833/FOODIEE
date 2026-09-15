const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Recipe = require("./models/Recipe");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const possibleDistPaths = [
  path.join(__dirname, "dist"),
  path.join(process.cwd(), "server", "dist"),
  path.join(process.cwd(), "dist"),
  path.join(__dirname, "..", "client", "dist"),
  path.join(process.cwd(), "client", "dist")
];

const frontendDist = possibleDistPaths.find((p) => fs.existsSync(p));
if (frontendDist) {
  app.use(express.static(frontendDist));
}

let isMongoConnected = false;

let localRecipes = [
  {
    _id: "seed-1",
    title: "Classic Margherita Pizza",
    category: "Italian",
    taste: "Savory & Cheesy",
    ingredients: "Pizza dough, San Marzano tomatoes, Fresh mozzarella, Basil leaves, Olive oil",
    rating: 4.8,
    ratingsCount: 14,
    price: 349,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Mario Rossi",
    chefEmail: "mario@foodiee.com",
    chefId: "usr-mario",
    reviews: [{ userName: "Elena Rostova", rating: 5, comment: "Authentic Neapolitan crust!", createdAt: "2026-09-01T10:00:00.000Z" }]
  },
  {
    _id: "seed-2",
    title: "Creamy Butter Chicken",
    category: "Indian",
    taste: "Rich & Tangy",
    ingredients: "Tandoori Chicken, Butter, Tomato gravy, Heavy cream, Garam masala, Naan",
    rating: 4.9,
    ratingsCount: 22,
    price: 420,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Sanjeev Kapoor",
    chefEmail: "sanjeev@foodiee.com",
    chefId: "usr-sanjeev",
    reviews: []
  },
  {
    _id: "seed-3",
    title: "Paneer Tikka Grill",
    category: "Indian",
    taste: "Spicy & Smoky",
    ingredients: "Paneer cubes, Bell peppers, Red onions, Tandoori spices, Mint chutney",
    rating: 4.7,
    ratingsCount: 9,
    price: 290,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Priya Patel",
    chefEmail: "priya@foodiee.com",
    chefId: "usr-priya",
    reviews: []
  },
  {
    _id: "seed-5",
    title: "Hyderabadi Dum Biryani",
    category: "Indian",
    taste: "Aromatic & Spicy",
    ingredients: "Basmati rice, Spiced Chicken, Caramelized onions, Saffron, Mint",
    rating: 4.9,
    ratingsCount: 35,
    price: 380,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Tariq Khan",
    chefEmail: "tariq@foodiee.com",
    chefId: "usr-tariq",
    reviews: []
  }
];

let usersStore = [];
let ordersStore = [];

const seedDatabaseIfNeeded = async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      await Recipe.insertMany(localRecipes.map(({ _id, ...rest }) => rest));
    }
  } catch (err) {
    console.error("Database seed failed:", err.message);
  }
};

const mongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();
if (mongoUri) {
  mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      isMongoConnected = true;
      console.log("MongoDB connected.");
      seedDatabaseIfNeeded();
    })
    .catch((err) => {
      isMongoConnected = false;
      console.log("MongoDB fallback mode active.");
    });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

app.get("/api/recipes", async (req, res) => {
  try {
    if (isMongoConnected) {
      const recipes = await Recipe.find();
      return res.json(recipes);
    }
    res.json(localRecipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/recipes", upload.single("image"), async (req, res) => {
  try {
    const recipeData = {
      title: req.body.title,
      category: req.body.category,
      taste: req.body.taste,
      ingredients: req.body.ingredients,
      rating: Number(req.body.rating) || 5.0,
      ratingsCount: 1,
      price: Number(req.body.price) || 0,
      image: req.file ? req.file.filename : (req.body.image || ""),
      chefName: req.body.chefName || "Home Chef",
      chefEmail: req.body.chefEmail ? req.body.chefEmail.toLowerCase() : "",
      chefId: req.body.chefId || "usr-anon",
      reviews: []
    };

    if (isMongoConnected) {
      const recipe = new Recipe(recipeData);
      const saved = await recipe.save();
      return res.status(201).json(saved);
    }

    const newLocalRecipe = { _id: "loc-" + Date.now(), ...recipeData };
    localRecipes.unshift(newLocalRecipe);
    res.status(201).json(newLocalRecipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/recipes/:id", upload.single("image"), async (req, res) => {
  try {
    const updatedData = { ...req.body };
    if (req.file) updatedData.image = req.file.filename;
    if (updatedData.rating) updatedData.rating = Number(updatedData.rating);
    if (updatedData.price) updatedData.price = Number(updatedData.price);

    if (isMongoConnected && !req.params.id.startsWith("seed-") && !req.params.id.startsWith("loc-")) {
      const updated = await Recipe.findByIdAndUpdate(req.params.id, updatedData, { new: true });
      return res.json(updated);
    }

    const index = localRecipes.findIndex((r) => r._id === req.params.id);
    if (index !== -1) {
      localRecipes[index] = { ...localRecipes[index], ...updatedData };
      return res.json(localRecipes[index]);
    }

    res.status(404).json({ error: "Recipe not found" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/recipes/:id", async (req, res) => {
  try {
    if (isMongoConnected && !req.params.id.startsWith("seed-") && !req.params.id.startsWith("loc-")) {
      await Recipe.findByIdAndDelete(req.params.id);
      return res.json({ success: true });
    }

    localRecipes = localRecipes.filter((r) => r._id !== req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/recipes/:id/rate", async (req, res) => {
  try {
    const { userEmail, userName, rating, comment } = req.body;
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const newReview = {
      userName: userName || "Gourmet Foodie",
      userEmail: userEmail || "",
      rating: Number(rating),
      comment: comment || "Great dish!",
      createdAt: new Date().toISOString()
    };

    let targetRecipe = null;
    if (isMongoConnected && !req.params.id.startsWith("seed-") && !req.params.id.startsWith("loc-")) {
      const recipeDoc = await Recipe.findById(req.params.id);
      if (recipeDoc) {
        if (!recipeDoc.reviews) recipeDoc.reviews = [];
        recipeDoc.reviews.unshift(newReview);
        const sum = recipeDoc.reviews.reduce((acc, r) => acc + r.rating, 0);
        recipeDoc.ratingsCount = recipeDoc.reviews.length;
        recipeDoc.rating = Number((sum / recipeDoc.ratingsCount).toFixed(1));
        targetRecipe = await recipeDoc.save();
      }
    } else {
      const idx = localRecipes.findIndex((r) => r._id === req.params.id);
      if (idx !== -1) {
        if (!localRecipes[idx].reviews) localRecipes[idx].reviews = [];
        localRecipes[idx].reviews.unshift(newReview);
        const sum = localRecipes[idx].reviews.reduce((acc, r) => acc + r.rating, 0);
        localRecipes[idx].ratingsCount = localRecipes[idx].reviews.length;
        localRecipes[idx].rating = Number((sum / localRecipes[idx].ratingsCount).toFixed(1));
        targetRecipe = localRecipes[idx];
      }
    }

    if (!targetRecipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(targetRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, address, pincode } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password required" });
  }

  const lowerEmail = email.toLowerCase();
  const existing = usersStore.find((u) => u.email.toLowerCase() === lowerEmail);
  if (existing) {
    return res.status(400).json({ error: "Account already exists with this email." });
  }

  const newUser = { id: "usr-" + Date.now(), name, email: lowerEmail, password, phone: phone || "", address: address || "", pincode: pincode || "" };
  usersStore.push(newUser);
  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ user: userSafe, message: "Account created successfully!" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ error: "Account not found." });
  if (user.password !== password) return res.status(401).json({ error: "Incorrect password." });

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe, message: "Logged in successfully!" });
});

app.get("/api/orders", (req, res) => {
  const { userId, userEmail, chefEmail, type } = req.query;
  if (!userId && !userEmail && !chefEmail) return res.json([]);

  if (type === "received" || chefEmail) {
    const targetChef = (chefEmail || userEmail || "").toLowerCase();
    const salesOrders = ordersStore.filter((o) => o.items && o.items.some((item) => (item.chefEmail || "").toLowerCase() === targetChef));
    return res.json(salesOrders);
  }

  const targetEmail = (userEmail || "").toLowerCase();
  const customerOrders = ordersStore.filter((o) => (userId && o.userId === userId) || (targetEmail && o.userEmail && o.userEmail.toLowerCase() === targetEmail));
  res.json(customerOrders);
});

app.post("/api/orders", (req, res) => {
  const { userId, userEmail, userName, phone, address, pincode, items, subtotal, deliveryFee, taxes, totalAmount, paymentMethod } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: "Cart is empty" });

  const newOrder = {
    _id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    userId: userId || "usr-guest",
    userEmail: userEmail ? userEmail.toLowerCase() : "",
    userName: userName || "Customer",
    phone: phone || "",
    address: `${address || "Address"} ${pincode ? `(${pincode})` : ""}`,
    items: items.map((item) => ({ ...item, chefName: item.chefName || "Home Chef", chefEmail: (item.chefEmail || "").toLowerCase() })),
    subtotal: subtotal || 0,
    deliveryFee: deliveryFee || 40,
    taxes: taxes || 0,
    totalAmount: totalAmount || 0,
    paymentMethod: paymentMethod || "Cash on Delivery",
    status: "Preparing in Kitchen",
    createdAt: new Date().toISOString()
  };

  ordersStore.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.put("/api/orders/:id/status", (req, res) => {
  const order = ordersStore.find((o) => o._id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (req.body.status) order.status = req.body.status;
  res.json(order);
});

app.use((req, res) => {
  const targetDist = possibleDistPaths.find((p) => fs.existsSync(p));
  if (targetDist && fs.existsSync(path.join(targetDist, "index.html"))) {
    return res.sendFile(path.join(targetDist, "index.html"));
  }
  res.status(404).send("Foodiee API running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
