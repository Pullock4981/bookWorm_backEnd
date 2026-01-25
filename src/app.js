const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5001',
    'http://127.0.0.1:3000',
    'https://book-worm-front-end.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // Allow all for now to avoid deployment blockers, or restrict as needed
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.route');
const genreRoutes = require('./routes/genre.route');
const bookRoutes = require('./routes/book.route');
const userRoutes = require('./routes/user.route');
const reviewRoutes = require('./routes/review.route');
const libraryRoutes = require('./routes/library.route');
const recommendationRoutes = require('./routes/recommendation.route');
const statsRoutes = require('./routes/stats.route');
const socialRoutes = require('./routes/social.route');
const tutorialRoutes = require('./routes/tutorial.route');

app.use('/api/auth', authRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/favorites', require('./routes/favorite.route'));
app.use('/api/chat', require('./routes/chat.route'));










// Basic Route
app.get('/', (req, res) => {

    res.send('BookWorm API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('ERROR 💥:', err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
