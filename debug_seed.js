const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const debug = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        const users = await User.find();
        console.log('Users found:', users.length);
        const Book = require('./src/models/Book');
        const books = await Book.find();
        console.log('Books found:', books.length);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
