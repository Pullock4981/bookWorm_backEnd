const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.route');
const genreRoutes = require('./routes/genre.route');
const bookRoutes = require('./routes/book.route');
const userRoutes = require('./routes/user.route');
const reviewRoutes = require('./routes/review.route');

app.use('/api/auth', authRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/reviews', reviewRoutes);





// Basic Route
app.get('/', (req, res) => {

    res.send('BookWorm API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
