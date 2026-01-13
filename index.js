const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

// Connect to Database
connectDB();

module.exports = app;
