# BookWorm Backend 📚🐛

Welcome to the **BookWorm Backend**, a robust and scalable Node.js/Express API designed to power the BookWorm social reading platform. This backend handles everything from user authentication and library management to social interactions and personalized book recommendations.

---

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication with `httpOnly` cookies and local storage fallback.
- **Library Management**: Users can organize books into shelves (*Want to Read*, *Currently Reading*, *Read*) and track reading progress.
- **Social Features**: Follow/unfollow users, real-time activity feeds, and suggested reader connections.
- **Smart Recommendations**: A personalized recommendation engine based on user genres and reading history.
- **Admin Dashboard**: Comprehensive stats and management tools for administrators.
- **Content Management**: Full CRUD for books and genres with Cloudinary integration for cover images and PDFs.
- **Performance Optimized**: Consistent use of `.lean()`, parallel queries with `Promise.all`, and efficient database indexing.
- **Moderation System**: Review submission and approval workflow for admin oversight.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS
- **File Storage**: Cloudinary (via Multer)
- **Validation**: Zod
- **Logging**: Morgan
- **Security**: Helmet, CORS, and Express Rate Limit

---

## 📂 Project Structure

```text
BookWorm_backEnd/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas & models
│   ├── routes/         # Express API routes
│   ├── services/       # Core business logic
│   ├── middleware/     # Auth & error handling middlewares
│   ├── config/         # DB & Cloudinary configurations
│   ├── utils/          # Helper functions
│   └── app.js          # Express app entry point
├── index.js            # Vercel serverless entry point
├── vercel.json         # Vercel deployment config
└── seed_all.js         # Master data seeding script
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd BookWorm_backEnd
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=your_frontend_url
   NODE_ENV=development

   # Cloudinary Config
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```

4. **Seed Database (Optional)**:
   ```bash
   node seed_all.js
   ```

5. **Run Locally**:
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints (Quick Reference)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **AUTH** | `/api/auth/register` | Register a new account |
| | `/api/auth/login` | Login and get tokens |
| **BOOKS** | `/api/books` | Get all books (with search/filter) |
| | `/api/books/:id` | Get single book details |
| **LIBRARY** | `/api/library/add` | Add book to personal shelf |
| | `/api/library/update-progress` | Log pages read |
| **SOCIAL** | `/api/social/feed` | Get activity feed |
| | `/api/social/follow/:id` | Follow another user |
| **STATS** | `/api/stats/user` | Get personal reading stats & streak |
| | `/api/stats/admin` | Get platform-wide admin stats |

---

## ☁️ Deployment

This backend is optimized for **Vercel**. The `index.js` file at the root handles serverless execution.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` and follow the prompts.
3. Add your Environment Variables in the Vercel Dashboard.

---

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Developed with ❤️ for the BookWorm Community.*
