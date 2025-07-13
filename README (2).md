# 🍽️ FOODIEE - Recipe Sharing Web App

**FOODIEE** is a modern full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that allows users to browse, add, edit, and favorite recipes. With a clean UI and support for image uploads, it's the perfect platform for food lovers to share and discover new dishes!

## 🚀 Features

- 🧾 View a list of recipes with images, categories, and ratings
- ➕ Add new recipes with title, taste, ingredients, price, and image
- ✏️ Edit or delete existing recipes
- ⭐ Mark/unmark favorites and view them separately
- 📁 Upload recipe images via file input
- 📱 Responsive layout for desktop & mobile

---

## 🛠️ Tech Stack

- **Frontend**: React.js, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Image Uploads**: Multer
- **Deployment**: Render (free tier)

---

## 📂 Folder Structure

```
FOODIEE/
│
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/   # Sidebar, RecipeList, AddForm, etc.
│   │   ├── assets/       # Default images
│   │   └── App.js
│   └── .env              # React environment variables
│
├── server/               # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── uploads/          # Stores uploaded images
│   ├── server.js
│   └── .env              # Backend environment variables
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Sujan833/FOODIEE.git
cd FOODIEE
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend:

```bash
npm start
```

---

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in `client/` with:

```
REACT_APP_SERVER_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

---

## 🌍 Deployment

The app is deployed using [Render](https://render.com). To deploy your own version:

- Push the full repo to GitHub
- Connect both `client/` and `server/` to separate Render services
- Use environment variables as shown above

---

## 📸 Screenshots

| Home Page                | Recipe Detail View         |
|--------------------------|----------------------------|
| ![Home](screenshots/home.png) | ![Detail](screenshots/detail.png) |

---

## 🤝 Credits

Made with ❤️ by [@Sujan833](https://github.com/Sujan833)

---

## 📄 License

This project is licensed under the MIT License.