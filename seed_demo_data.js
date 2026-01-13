const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Book = require('./src/models/Book');
const Activity = require('./src/models/Activity');
const Review = require('./src/models/Review');
const Library = require('./src/models/Library');
const Genre = require('./src/models/Genre');

dotenv.config();

const demoUsers = [
    {
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        password: "password123",
        role: "User",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Michael Chen",
        email: "michael.c@example.com",
        password: "password123",
        role: "User",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Emily Rodriguez",
        email: "emily.r@example.com",
        password: "password123",
        role: "User",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "David Kim",
        email: "david.k@example.com",
        password: "password123",
        role: "User",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Jessica Wilde",
        email: "jess.w@example.com",
        password: "password123",
        role: "User",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    }
];

const comments = [
    "Absolutely loved this book! Couldn't put it down.",
    "A bit slow at the start, but the ending was worth it.",
    "The character development was incredible.",
    "Not my favorite from this author, but still a solid read.",
    "A masterpiece of modern literature.",
    "I learned so much from this. Highly recommended!",
    "The plot twists kept me guessing until the very end."
];

const seedDemoData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        // 1. Create Users
        console.log('Seeding Users...');
        const createdUsers = [];
        for (const u of demoUsers) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create(u);
                console.log(`Created user: ${user.name}`);
            } else {
                console.log(`User exists: ${user.name}`);
            }
            createdUsers.push(user);
        }

        // 2. Get Books
        const books = await Book.find({});
        if (books.length === 0) {
            console.log('No books found. Skipping activity generation.');
            process.exit();
        }

        // 3. Generate Random Activities
        console.log('Generating Activities...');
        const activities = [];

        for (const user of createdUsers) {
            // Each user interacts with 3-5 random books
            const numInteractions = Math.floor(Math.random() * 3) + 3;
            // Shuffle books to pick random ones
            const shuffledBooks = books.sort(() => 0.5 - Math.random()).slice(0, numInteractions);

            for (const book of shuffledBooks) {
                const actionType = Math.random();

                if (actionType < 0.4) {
                    // Scenario 1: Finished Reading (Add to Library + Activity)
                    await Library.findOneAndUpdate(
                        { user: user._id, book: book._id },
                        { shelf: 'Read', progress: 100 },
                        { upsert: true, new: true }
                    );

                    activities.push({
                        user: user._id,
                        type: 'FINISHED_BOOK',
                        book: book._id,
                        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random time in past ~10 days
                    });

                } else if (actionType < 0.7) {
                    // Scenario 2: Rated/Reviewed (Add Review + Activity)
                    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
                    const comment = comments[Math.floor(Math.random() * comments.length)];

                    await Review.create({
                        user: user._id,
                        book: book._id,
                        rating: rating,
                        review: comment,
                        status: 'Approved'
                    });

                    activities.push({
                        user: user._id,
                        type: 'RATED_BOOK',
                        book: book._id,
                        data: { rating },
                        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
                    });

                } else {
                    // Scenario 3: Added to Read shelf (Add to Library + Activity)
                    await Library.findOneAndUpdate(
                        { user: user._id, book: book._id },
                        { shelf: 'Want to Read', progress: 0 },
                        { upsert: true, new: true }
                    );

                    // We map ADD_TO_READ to 'Read' shelf usually, but let's stick to the types
                    // 'ADD_TO_READ' is specifically for moving to Read shelf in the service, 
                    // but let's simulate adding to "Read" list specifically for the feed event

                    activities.push({
                        user: user._id,
                        type: 'ADD_TO_READ',
                        book: book._id,
                        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
                    });
                }
            }
        }

        // Insert Activities
        if (activities.length > 0) {
            // Sort by date so feed looks natural
            activities.sort((a, b) => a.createdAt - b.createdAt);
            await Activity.insertMany(activities);
            console.log(`Seeded ${activities.length} new activities!`);
        }

        process.exit();

    } catch (error) {
        console.error('Error seeding demo data:', error);
        process.exit(1);
    }
};

seedDemoData();
