const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./src/models/Review');
const Book = require('./src/models/Book');
const User = require('./src/models/User');
const Genre = require('./src/models/Genre');

dotenv.config();

const demoReviews = [
    {
        text: "Absolutely fantastic read! The plot twists kept me on the edge of my seat.",
        rating: 5,
        status: 'Approved'
    },
    {
        text: "It was okay, but the middle part dragged on a bit too long for my taste.",
        rating: 3,
        status: 'Approved'
    },
    {
        text: "I didn't like the ending. It felt rushed and unresolved.",
        rating: 2,
        status: 'Pending'
    },
    {
        text: "Great character development, but the setting was a bit confusing.",
        rating: 4,
        status: 'Pending'
    },
    {
        text: "Highly recommended for fans of the genre! Can't wait for the sequel.",
        rating: 5,
        status: 'Pending'
    },
    {
        text: "This book changed my perspective on life. A must-read.",
        rating: 5,
        status: 'Approved'
    }
];

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // unique index on { book: 1, user: 1 } prevents multiple reviews from same user on same book
        // So we need to be careful.

        const books = await Book.find();
        const users = await User.find();

        if (books.length === 0 || users.length === 0) {
            console.log('⚠️ Need at least 1 book and 1 user to seed reviews.');
            process.exit(1);
        }

        console.log(`Found ${books.length} books and ${users.length} users.`);

        let addedCount = 0;

        // Try to add reviews distributing them across books and users
        for (let i = 0; i < demoReviews.length; i++) {
            const reviewData = demoReviews[i];

            // Pick a random book and user using modulo to distribute
            const book = books[i % books.length];
            // Use different users if available, otherwise reuse (might fail if unique constraint hit, so we catch)
            const user = users[i % users.length];

            try {
                // Check if review already exists for this pair
                const exists = await Review.findOne({ book: book._id, user: user._id });
                if (!exists) {
                    await Review.create({
                        review: reviewData.text,
                        rating: reviewData.rating,
                        status: reviewData.status,
                        book: book._id,
                        user: user._id
                    });
                    console.log(`Added ${reviewData.status} review for "${book.title}" by ${user.name}`);
                    addedCount++;
                } else {
                    console.log(`Skipped review for "${book.title}" by ${user.name} (Already reviewed)`);

                    // Optional: Update the status of existing review to match our demo data if needed
                    // await Review.findByIdAndUpdate(exists._id, { status: reviewData.status });
                    // console.log(`Updated status to ${reviewData.status}`);
                }
            } catch (err) {
                console.log(`Failed to add review: ${err.message}`);
            }
        }

        console.log(`✅ Seeding complete! Added ${addedCount} new reviews.`);
        process.exit();
    } catch (error) {
        console.error('Error seeding reviews:', error);
        process.exit(1);
    }
};

seedReviews();
