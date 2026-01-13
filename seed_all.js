const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./src/models/Book');
const Genre = require('./src/models/Genre');
const Review = require('./src/models/Review');
const User = require('./src/models/User');

dotenv.config();

const genresData = [
    "Fiction", "Non-Fiction", "Self-Help", "History", "Science Fiction",
    "Mystery", "Biography", "Fantasy", "Philosophy", "Psychology"
];

const booksData = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genreName: "Fiction",
        description: "A story of money, love, and the American Dream in the 1920s.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 180
    },
    {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        genreName: "History",
        description: "A journey through the history of our species, from ancient humans to the modern age.",
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 443
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        genreName: "Self-Help",
        description: "An easy and proven way to build good habits and break bad ones.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 320
    },
    {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        genreName: "Mystery",
        description: "A shocking psychological thriller about a woman's act of violence against her husband.",
        coverImage: "https://images.unsplash.com/photo-1543004218-ee14110497f8?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 336
    },
    {
        title: "Dune",
        author: "Frank Herbert",
        genreName: "Science Fiction",
        description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.",
        coverImage: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 612
    },
    {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        genreName: "Psychology",
        description: "An exploration of the two systems that drive the way we think.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 499
    },
    {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genreName: "Fantasy",
        description: "Follow Bilbo Baggins on a quest to reclaim the lonely mountain.",
        coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 310
    },
    {
        title: "Meditations",
        author: "Marcus Aurelius",
        genreName: "Philosophy",
        description: "Personal writings of the Roman Emperor Marcus Aurelius.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 256
    },
    {
        title: "Steve Jobs",
        author: "Walter Isaacson",
        genreName: "Biography",
        description: "The exclusive biography of the creative entrepreneur who revolutionized six industries.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 656
    },
    {
        title: "Factfulness",
        author: "Hans Rosling",
        genreName: "Non-Fiction",
        description: "Ten reasons we're wrong about the world—and why things are better than you think.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        totalPages: 342
    }
];

const reviewsTexts = [
    "Amazing read! Highly recommend.",
    "Interesting perspective, but a bit long.",
    "Must read for everyone! Loved it.",
    "Good book, though some parts were slow.",
    "Mind-blowing! One of my favorites.",
    "Very informative and well-written.",
    "A bit overrated but still decent.",
    "Could not put it down! Absolutely brilliant.",
    "Well researched and engaging.",
    "Life changing experience reading this."
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // 1. Get or Create Demo User
        let user = await User.findOne({ role: 'User' });
        if (!user) {
            user = await User.create({
                name: "Demo User",
                email: "demo@example.com",
                password: "password123",
                role: "User"
            });
        }

        // 2. Process Genres
        const genreMap = {};
        for (const name of genresData) {
            let genre = await Genre.findOne({ name });
            if (!genre) {
                genre = await Genre.create({ name });
            }
            genreMap[name] = genre._id;
        }

        // 3. Process Books & Reviews
        for (const bData of booksData) {
            let book = await Book.findOne({ title: bData.title });

            if (!book) {
                book = await Book.create({
                    ...bData,
                    genre: genreMap[bData.genreName]
                });
                console.log(`Created book: ${book.title}`);
            }

            // Create 3 reviews per book if no reviews exist
            const existingReviewsCount = await Review.countDocuments({ book: book._id });
            if (existingReviewsCount === 0) {
                // To avoid duplicate key error, we'll create reviews with different demo users or just 1 for now if only 1 user exists
                // Since our model has unique(book, user), we can only add 1 review per user

                const existingReview = await Review.findOne({ book: book._id, user: user._id });
                if (!existingReview) {
                    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
                    const reviewText = reviewsTexts[Math.floor(Math.random() * reviewsTexts.length)];

                    await Review.create({
                        review: reviewText,
                        rating: rating,
                        book: book._id,
                        user: user._id,
                        status: 'Approved'
                    });

                    // Manually trigger rating calculation
                    await Review.calcAverageRatings(book._id);
                    console.log(`Added review for: ${book.title}`);
                }
            }
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
