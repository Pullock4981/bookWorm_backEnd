const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Genre = require('./src/models/Genre');
const User = require('./src/models/User');
const Book = require('./src/models/Book');
const Activity = require('./src/models/Activity');
const Review = require('./src/models/Review');
const Library = require('./src/models/Library');

dotenv.config();

const backfillActivities = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        // Clear existing activities to avoid duplicates during dev
        await Activity.deleteMany({});
        console.log('Cleared existing activities');

        const activities = [];

        // 1. Backfill Reviews (RATED_BOOK)
        const reviews = await Review.find({ status: 'Approved' });
        for (const review of reviews) {
            activities.push({
                user: review.user,
                type: 'RATED_BOOK',
                book: review.book,
                data: { rating: review.rating },
                createdAt: review.createdAt,
                updatedAt: review.updatedAt
            });
        }
        console.log(`Found ${reviews.length} reviews to backfill.`);

        // 2. Backfill Library 'Read' (ADD_TO_READ & FINISHED_BOOK)
        // Note: We'll treat current 'Read' shelf items as 'FINISHED_BOOK' for simplicity
        // or 'ADD_TO_READ'. Let's use 'FINISHED_BOOK' as it's more significant.
        const libraryEntries = await Library.find({ shelf: 'Read' });
        for (const entry of libraryEntries) {
            // Add 'Finished' activity
            activities.push({
                user: entry.user,
                type: 'FINISHED_BOOK',
                book: entry.book,
                createdAt: entry.updatedAt, // Use update time as proxy
                updatedAt: entry.updatedAt
            });
        }
        console.log(`Found ${libraryEntries.length} completed books to backfill.`);

        if (activities.length > 0) {
            await Activity.insertMany(activities);
            console.log(`Successfully seeded ${activities.length} activities!`);
        } else {
            console.log('No historical data found to seed.');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding activities:', error.message);
        process.exit(1);
    }
};

backfillActivities();
