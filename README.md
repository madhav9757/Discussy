
<h1 align="center">Discussy 🚀</h1>

<p align="center">
  <strong>A full-featured Reddit clone built with the MERN stack.</strong><br/>
  Explore, create, and join vibrant communities. Discuss ideas, share content, and build connections.
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/madhav9757/Discussy" alt="License" />
  <img src="https://img.shields.io/github/languages/top/madhav9757/Discussy" alt="Top Language" />
  <img src="https://img.shields.io/github/last-commit/madhav9757/Discussy" alt="Last Commit" />
</p>

---

## 📸 Demo

> [Live Demo](https://your-live-url.com) *(optional)*

![Discussy UI Screenshot](https://your-screenshot-url.com) <!-- Replace with actual image link -->

---

## 🧩 Key Features

- 🔐 **Authentication** – Register, Login, Logout with JWT
- 🌐 **Communities** – Create, browse, search, and filter communities
- 🔥 **Trending Section** – Auto-detect trending communities
- 📝 **Posts** – Create, edit, delete, and view posts with Markdown
- 💬 **Comments** – Inline comment replies, editing, and voting
- 🔍 **Search Modal** – Fast search with real-time filtering
- 📊 **Filters & Sorting** – Category, members, activity level
- 🎯 **Responsive UI** – Fully mobile/tablet compatible
- ✨ **Modern UI/UX** – Glassmorphism, smooth animations, custom design

---

## 📂 Project Structure

```
Discussy/
├── client/          # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── app/             # Redux store and API setup
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Redux slices and logic for specific features (e.g., auth, posts)
│   │   ├── pages/           # Top-level page components (e.g., Home, Community, Create Post)
│   │   └── styles/          # Global styles, variables
│   └── .env                 # Frontend environment variables
└── server/          # Node.js Express Backend API
    ├── config/          # Database connection, JWT config
    ├── controllers/     # Business logic for routes
    ├── middleware/      # Authentication middleware, error handling
    ├── models/          # Mongoose schemas
    ├── routes/          # API endpoints
    ├── .env             # Backend environment variables
    └── server.js        # Main server entry point
```

---

## ⚙️ Tech Stack

### Frontend
- React
- Redux Toolkit + RTK Query
- React Router
- Styled Components / CSS Modules
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- CORS, dotenv, etc.

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/madhav9757/Discussy.git
cd Discussy
```

### 2️⃣ Backend Setup
```bash
cd server
npm install
npm run dev
```

Create a `.env` file in `/server` with:
```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_super_secret_key
```

### 3️⃣ Frontend Setup
```bash
cd client
npm install
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)  
- Backend: [http://localhost:5000](http://localhost:5000)

---

## 🧠 Learnings

Discussy was built as a full-stack learning project, focusing on:

 - Scalable Component Design: Architecting reusable and maintainable React components.
 - Advanced State Management: Effectively utilizing Redux Toolkit and RTK Query for complex application states and optimized data fetching.
 - Backend Security: Implementing robust route protection and user authentication with JWT.
 - Dynamic Data Handling: Mastering real-time data filtering, sorting, and search for optimal client-side performance.
 - Modern UI/UX Implementation: Translating design concepts like Glassmorphism into a functional and aesthetic user interface.

---

## 🤝 Contributing

While this project is currently under active development, I’m not accepting public contributions yet.

However, feel free to:
- Fork the repo
- Explore the code
- Share feedback or open issues!

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Madhav Semwal**  
- [GitHub](https://github.com/madhav9757)  
- [LinkedIn](https://www.linkedin.com/in/your-linkedin/) <!-- Replace with actual link -->

---

## 📌 Next Steps for You

1. Replace placeholder links like:
   - Live demo URL
   - Screenshot/GIF preview
   - LinkedIn profile
2. Optionally add badges for build, deployment, or Vercel/Render status.
