require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const http = require('http');
const { Server } = require('socket.io');
const initializeSocket = require('./socket');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
