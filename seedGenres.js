const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Genre = require('./src/models/Genre');

// Load env vars
dotenv.config();

const genres = [
    { name: 'Fiction', description: 'Narrative works based on imagination.' },
    { name: 'Non-Fiction', description: 'Informational works based on facts.' },
    { name: 'Science Fiction', description: 'Speculative fiction typically dealing with futuristic concepts.' },
    { name: 'Mystery', description: 'Fiction dealing with the solution of a crime or the unraveling of secrets.' },
    { name: 'Fantasy', description: 'Fiction set in a fictional universe, often inspired by real world myth and folklore.' },
    { name: 'Biography', description: 'A detailed description of a person\'s life.' },
    { name: 'History', description: 'The study of past events.' },
    { name: 'Romance', description: 'Works focusing on romantic love and relationships.' },
    { name: 'Technology', description: 'Books about computers, programming, and engineering.' },
    { name: 'Self-Help', description: 'Books written with the intention to instruct its readers on solving personal problems.' }
];

const seedGenres = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check if genres exist
        const count = await Genre.countDocuments();
        if (count > 0) {
            console.log('Genres already exist. Skipping seed.');
            process.exit();
        }

        await Genre.insertMany(genres);
        console.log('✅ Default genres added successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding genres:', error);
        process.exit(1);
    }
};

seedGenres();
