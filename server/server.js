const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Recipe = require("./models/Recipe");

const app = express();

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const possibleDistPaths = [
  path.join(__dirname, "..", "client", "dist"),
  path.join(process.cwd(), "client", "dist"),
  path.join(__dirname, "dist"),
  path.join(process.cwd(), "dist")
];

const frontendDist = possibleDistPaths.find((p) => fs.existsSync(p));

if (frontendDist) {
  console.log("Serving static frontend from:", frontendDist);
  app.use(express.static(frontendDist));
} else {
  console.log("Warning: No static frontend dist folder found.");
}



let isMongoConnected = false;

// 16+ Seed Recipe Menu with Home Chef Attributions & Initial Reviews
let localRecipes = [
  {
    _id: "seed-1",
    title: "Classic Margherita Pizza",
    category: "Italian",
    taste: "Savory & Cheesy",
    ingredients: "Pizza dough, San Marzano tomatoes, Fresh mozzarella, Basil leaves, Extra virgin olive oil",
    rating: 4.8,
    ratingsCount: 14,
    price: 349,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Mario Rossi",
    chefEmail: "mario@foodiee.com",
    chefId: "usr-mario",
    reviews: [
      { userName: "Elena Rostova", rating: 5, comment: "Authentic Neapolitan crust! Tastes like Naples.", createdAt: "2026-09-01T10:00:00.000Z" }
    ]
  },
  {
    _id: "seed-2",
    title: "Creamy Butter Chicken",
    category: "Indian",
    taste: "Rich & Tangy",
    ingredients: "Tandoori Chicken, Butter, Tomato gravy, Heavy cream, Garam masala, Garlic Naan",
    rating: 4.9,
    ratingsCount: 22,
    price: 420,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Sanjeev Kapoor",
    chefEmail: "sanjeev@foodiee.com",
    chefId: "usr-sanjeev",
    reviews: [
      { userName: "Aarav Sharma", rating: 5, comment: "Silky smooth gravy and perfectly charred chicken!", createdAt: "2026-09-02T14:30:00.000Z" }
    ]
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
    reviews: [
      { userName: "Rahul V", rating: 5, comment: "Super fresh paneer and crisp mint chutney.", createdAt: "2026-09-03T18:20:00.000Z" }
    ]
  },
  {
    _id: "seed-4",
    title: "Avocado Toast & Egg",
    category: "Breakfast",
    taste: "Fresh & Creamy",
    ingredients: "Artisanal Sourdough, Poached eggs, Ripe avocado, Chili flakes, Microgreens",
    rating: 4.6,
    ratingsCount: 8,
    price: 220,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Emma Stone",
    chefEmail: "emma@foodiee.com",
    chefId: "usr-emma",
    reviews: []
  },
  {
    _id: "seed-5",
    title: "Hyderabadi Dum Biryani",
    category: "Indian",
    taste: "Aromatic & Spicy",
    ingredients: "Basmati rice, Spiced Chicken, Caramelized onions, Saffron, Mint, Mirchi ka Salan",
    rating: 4.9,
    ratingsCount: 35,
    price: 380,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Tariq Khan",
    chefEmail: "tariq@foodiee.com",
    chefId: "usr-tariq",
    reviews: [
      { userName: "Sameer Verma", rating: 5, comment: "The saffron aroma and tender meat are unbeatable!", createdAt: "2026-09-04T12:00:00.000Z" }
    ]
  },
  {
    _id: "seed-6",
    title: "Truffle Mushroom Pasta",
    category: "Italian",
    taste: "Umani & Creamy",
    ingredients: "Fettuccine pasta, Wild forest mushrooms, Black truffle oil, Parmesan, Garlic cream",
    rating: 4.8,
    ratingsCount: 11,
    price: 399,
    image: "https://images.unsplash.com/photo-1621996346565-e3def6164092?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Giovanni",
    chefEmail: "giovanni@foodiee.com",
    chefId: "usr-giovanni",
    reviews: []
  },
  {
    _id: "seed-7",
    title: "Smash Cheeseburger & Fries",
    category: "Fast Food",
    taste: "Juicy & Savory",
    ingredients: "Double beef/veggie patty, Melted cheddar, Secret sauce, Pickles, Crispy fries",
    rating: 4.7,
    ratingsCount: 18,
    price: 299,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Alex Miller",
    chefEmail: "alex@foodiee.com",
    chefId: "usr-alex",
    reviews: []
  },
  {
    _id: "seed-8",
    title: "Thai Green Curry Bowl",
    category: "Asian",
    taste: "Coconut & Spicy",
    ingredients: "Thai green curry paste, Coconut milk, Bamboo shoots, Tofu/Chicken, Jasmine rice",
    rating: 4.6,
    ratingsCount: 7,
    price: 360,
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Mei Lin",
    chefEmail: "mei@foodiee.com",
    chefId: "usr-mei",
    reviews: []
  },
  {
    _id: "seed-9",
    title: "Spicy Miso Ramen Bowl",
    category: "Asian",
    taste: "Rich & Savory",
    ingredients: "Ramen noodles, Miso broth, Soft boiled egg, Chashu pork/tofu, Nori, Green onions",
    rating: 4.8,
    ratingsCount: 16,
    price: 340,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Kenji Sato",
    chefEmail: "kenji@foodiee.com",
    chefId: "usr-kenji",
    reviews: []
  },
  {
    _id: "seed-10",
    title: "Dal Makhani Special",
    category: "Indian",
    taste: "Creamy & Smoky",
    ingredients: "Slow-cooked black lentils, Butter, Cream, Cumin, Kashmiri chili, Butter Rotis",
    rating: 4.8,
    ratingsCount: 20,
    price: 280,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Sanjeev Kapoor",
    chefEmail: "sanjeev@foodiee.com",
    chefId: "usr-sanjeev",
    reviews: []
  },
  {
    _id: "seed-11",
    title: "Molten Chocolate Lava Cake",
    category: "Dessert",
    taste: "Sweet & Chocolaty",
    ingredients: "Dark chocolate cake, Gooey chocolate fudge center, Vanilla bean ice cream scoop",
    rating: 4.9,
    ratingsCount: 25,
    price: 190,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Sophie Blanc",
    chefEmail: "sophie@foodiee.com",
    chefId: "usr-sophie",
    reviews: []
  },
  {
    _id: "seed-12",
    title: "Artisanal Tiramisu",
    category: "Dessert",
    taste: "Espresso & Sweet",
    ingredients: "Ladyfingers dipped in espresso, Mascarpone cream, Cocoa powder dusting",
    rating: 4.8,
    ratingsCount: 12,
    price: 240,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Mario Rossi",
    chefEmail: "mario@foodiee.com",
    chefId: "usr-mario",
    reviews: []
  },
  {
    _id: "seed-13",
    title: "Classic Lasagna Bolognese",
    category: "Italian",
    taste: "Hearty & Cheesy",
    ingredients: "Lasagna sheets, Slow-cooked Bolognese ragù, Ricotta cheese, Mozzarella crust",
    rating: 4.9,
    ratingsCount: 19,
    price: 410,
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Giovanni",
    chefEmail: "giovanni@foodiee.com",
    chefId: "usr-giovanni",
    reviews: []
  },
  {
    _id: "seed-14",
    title: "Chicken Tikka Masala",
    category: "Indian",
    taste: "Spicy & Creamy",
    ingredients: "Roasted chicken chunks, Spiced curry sauce, Onion gravy, Fresh Coriander, Naan",
    rating: 4.8,
    ratingsCount: 15,
    price: 395,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Priya Patel",
    chefEmail: "priya@foodiee.com",
    chefId: "usr-priya",
    reviews: []
  },
  {
    _id: "seed-15",
    title: "Crispy Buffalo Wings & Dip",
    category: "Fast Food",
    taste: "Spicy & Tangy",
    ingredients: "Crispy fried chicken wings, Spicy Buffalo glaze, Celery sticks, Ranch dip",
    rating: 4.7,
    ratingsCount: 10,
    price: 320,
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Alex Miller",
    chefEmail: "alex@foodiee.com",
    chefId: "usr-alex",
    reviews: []
  },
  {
    _id: "seed-16",
    title: "Mango Lassi Delight",
    category: "Dessert",
    taste: "Sweet & Refreshing",
    ingredients: "Alphonso mango pulp, Sweet yogurt, Cardamom, Pistachio flakes, Saffron garnish",
    rating: 4.9,
    ratingsCount: 30,
    price: 140,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    chefName: "Chef Priya Patel",
    chefEmail: "priya@foodiee.com",
    chefId: "usr-priya",
    reviews: []
  }
];

// Clean User & Order Storage
let usersStore = [];
let ordersStore = [];

// Seed MongoDB if empty and connected
const seedDatabaseIfNeeded = async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      console.log("Seeding initial recipes to MongoDB...");
      await Recipe.insertMany(localRecipes.map(({ _id, ...rest }) => rest));
    }
  } catch (err) {
    console.error("Failed to seed MongoDB:", err.message);
  }
};

// ✅ MongoDB connection with graceful fallback
const mongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();
if (mongoUri) {
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    tls: true,
    dbName: process.env.MONGO_DB_NAME || undefined,
  })
    .then(() => {
      isMongoConnected = true;
      console.log("✅ MongoDB connected successfully!");
      seedDatabaseIfNeeded();
    })
    .catch((err) => {
      isMongoConnected = false;
      console.log("⚠️ MongoDB Atlas unavailable: " + err.message);
      console.log("ℹ️ Check Atlas IP whitelist, username/password, cluster status, and network access. Falling back to local database mode.");
    });
} else {
  console.log("ℹ️ No MONGO_URI provided in .env. Running backend in local database mode.");
}

// ✅ Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ✅ Recipe Routes
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

    const newLocalRecipe = {
      _id: "loc-" + Date.now(),
      ...recipeData,
    };
    localRecipes.unshift(newLocalRecipe);
    res.status(201).json(newLocalRecipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/recipes/:id", upload.single("image"), async (req, res) => {
  try {
    const updatedData = { ...req.body };
    if (req.file) {
      updatedData.image = req.file.filename;
    }
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

// ✅ Rating & Review Endpoint
app.post("/api/recipes/:id/rate", async (req, res) => {
  try {
    const { userEmail, userName, rating, comment } = req.body;
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
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

    if (!targetRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(targetRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Authentication Routes with Password Verification
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, address, pincode } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const lowerEmail = email.toLowerCase();
  const existing = usersStore.find((u) => u.email.toLowerCase() === lowerEmail);
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists. Please Log In." });
  }

  const newUser = {
    id: "usr-" + Date.now(),
    name,
    email: lowerEmail,
    password, // In production, hash with bcrypt
    phone: phone || "",
    address: address || "",
    pincode: pincode || ""
  };
  usersStore.push(newUser);

  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ user: userSafe, message: "Account created successfully!" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const lowerEmail = email.toLowerCase();
  const user = usersStore.find((u) => u.email.toLowerCase() === lowerEmail);

  if (!user) {
    return res.status(404).json({ error: "No account found with this email. Please Sign Up first." });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: "Incorrect password. Please try again." });
  }

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe, message: "Logged in successfully!" });
});

// ✅ Dual-Role Orders API (Supports Placed Customer Orders & Received Chef Sales Orders)
app.get("/api/orders", (req, res) => {
  const { userId, userEmail, chefEmail, type } = req.query;

  if (!userId && !userEmail && !chefEmail) {
    return res.json([]);
  }

  if (type === "received" || chefEmail) {
    const targetChef = (chefEmail || userEmail || "").toLowerCase();
    const salesOrders = ordersStore.filter((o) => {
      if (o.items && Array.isArray(o.items)) {
        return o.items.some((item) => (item.chefEmail || "").toLowerCase() === targetChef);
      }
      return false;
    });
    return res.json(salesOrders);
  }

  // Default: Placed customer orders
  const targetEmail = (userEmail || "").toLowerCase();
  const customerOrders = ordersStore.filter((o) => {
    if (userId && o.userId === userId) return true;
    if (targetEmail && o.userEmail && o.userEmail.toLowerCase() === targetEmail) return true;
    return false;
  });

  res.json(customerOrders);
});

app.post("/api/orders", (req, res) => {
  const { userId, userEmail, userName, phone, address, pincode, items, subtotal, deliveryFee, taxes, totalAmount, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const newOrder = {
    _id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    userId: userId || "usr-guest",
    userEmail: userEmail ? userEmail.toLowerCase() : "",
    userName: userName || "Valued Customer",
    phone: phone || "",
    address: `${address || "Standard Delivery Address"} ${pincode ? `(${pincode})` : ""}`,
    items: items.map((item) => ({
      ...item,
      chefName: item.chefName || "Home Chef",
      chefEmail: (item.chefEmail || "").toLowerCase()
    })),
    subtotal: subtotal || 0,
    deliveryFee: deliveryFee || 40,
    taxes: taxes || 0,
    totalAmount: totalAmount || 0,
    paymentMethod: paymentMethod || "Cash on Delivery",
    status: "Preparing in Kitchen",
    createdAt: new Date().toISOString(),
    estimatedDeliveryMinutes: 35
  };

  ordersStore.unshift(newOrder);
  res.status(201).json(newOrder);
});

// ✅ Order Status Update (For Home-Chefs managing incoming orders)
app.put("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const order = ordersStore.find((o) => o._id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status) {
    order.status = status;
  }
  res.json(order);
});

// ✅ SPA Catch-all & Static Fallback (Express 5 safe middleware)
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  const targetDist = possibleDistPaths.find((p) => fs.existsSync(p));
  if (targetDist && fs.existsSync(path.join(targetDist, "index.html"))) {
    return res.sendFile(path.join(targetDist, "index.html"));
  }
  res.status(404).send("Foodiee API server is running live.");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
