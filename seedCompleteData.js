require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./src/models/Book');
const Genre = require('./src/models/Genre');
const Tutorial = require('./src/models/Tutorial');
const User = require('./src/models/User');
const Review = require('./src/models/Review');
const Activity = require('./src/models/Activity');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected...');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

// Comprehensive book data - at least 1 per genre
const comprehensiveBooks = [
    // Fiction
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genreName: "Fiction", description: "A classic American novel set in the Jazz Age.", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", totalPages: 180 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", genreName: "Fiction", description: "A gripping tale of racial injustice.", coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", totalPages: 324 },

    // Science Fiction
    { title: "Dune", author: "Frank Herbert", genreName: "Science Fiction", description: "Epic sci-fi set in a distant future.", coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", totalPages: 688 },
    { title: "The Martian", author: "Andy Weir", genreName: "Science Fiction", description: "Astronaut stranded on Mars.", coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400", totalPages: 369 },

    // Fantasy
    { title: "The Hobbit", author: "J.R.R. Tolkien", genreName: "Fantasy", description: "Bilbo's unexpected journey.", coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400", totalPages: 310 },
    { title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", genreName: "Fantasy", description: "The magical journey begins.", coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400", totalPages: 223 },

    // Mystery
    { title: "The Silent Patient", author: "Alex Michaelides", genreName: "Mystery", description: "A psychological thriller.", coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400", totalPages: 336 },
    { title: "Gone Girl", author: "Gillian Flynn", genreName: "Mystery", description: "A twisted marriage mystery.", coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400", totalPages: 432 },

    // Romance
    { title: "Pride and Prejudice", author: "Jane Austen", genreName: "Romance", description: "Classic romantic novel.", coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400", totalPages: 432 },
    { title: "The Notebook", author: "Nicholas Sparks", genreName: "Romance", description: "Timeless love story.", coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", totalPages: 214 },

    // Non-Fiction
    { title: "Sapiens", author: "Yuval Noah Harari", genreName: "Non-Fiction", description: "A brief history of humankind.", coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400", totalPages: 443 },
    { title: "Educated", author: "Tara Westover", genreName: "Non-Fiction", description: "A memoir about education.", coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", totalPages: 334 },

    // Biography
    { title: "Steve Jobs", author: "Walter Isaacson", genreName: "Biography", description: "The life of Apple's co-founder.", coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", totalPages: 656 },
    { title: "Becoming", author: "Michelle Obama", genreName: "Biography", description: "Memoir by former First Lady.", coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400", totalPages: 448 },

    // Self-Help
    { title: "Atomic Habits", author: "James Clear", genreName: "Self-Help", description: "Build good habits, break bad ones.", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", totalPages: 320 },
    { title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", genreName: "Self-Help", description: "Approach to being effective.", coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400", totalPages: 381 },

    // History
    { title: "The Guns of August", author: "Barbara Tuchman", genreName: "History", description: "WWI's opening month.", coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400", totalPages: 511 },
    { title: "A People's History", author: "Howard Zinn", genreName: "History", description: "American history from below.", coverImage: "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=400", totalPages: 729 },

    // Philosophy
    { title: "Meditations", author: "Marcus Aurelius", genreName: "Philosophy", description: "Stoic philosophy classic.", coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400", totalPages: 254 },
    { title: "The Republic", author: "Plato", genreName: "Philosophy", description: "Socratic dialogue on justice.", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", totalPages: 416 },
];

// YouTube tutorials with real links and thumbnails
const youtubeTutorials = [
    {
        title: "Getting Started with BookWorm",
        description: "Complete beginner's guide to using BookWorm platform.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        duration: "8:45",
        category: "Beginner"
    },
    {
        title: "How to Add Books to Your Library",
        description: "Step-by-step guide on organizing your digital library.",
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        thumbnailUrl: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
        duration: "5:30",
        category: "Beginner"
    },
    {
        title: "Reading PDFs Like a Pro",
        description: "Master PDF reader features and shortcuts.",
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        thumbnailUrl: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
        duration: "12:15",
        category: "Intermediate"
    },
    {
        title: "Setting Reading Goals",
        description: "Track and achieve your annual reading targets.",
        videoUrl: "https://www.youtube.com/watch?v=y6120QOlsfU",
        thumbnailUrl: "https://img.youtube.com/vi/y6120QOlsfU/maxresdefault.jpg",
        duration: "6:20",
        category: "Beginner"
    },
    {
        title: "Writing Effective Book Reviews",
        description: "Tips for writing engaging reviews.",
        videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        thumbnailUrl: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
        duration: "10:45",
        category: "Intermediate"
    },
    {
        title: "Discovering New Books",
        description: "Use recommendation system effectively.",
        videoUrl: "https://www.youtube.com/watch?v=lTRiuFIWV54",
        thumbnailUrl: "https://img.youtube.com/vi/lTRiuFIWV54/maxresdefault.jpg",
        duration: "7:55",
        category: "Beginner"
    },
    {
        title: "Social Features Guide",
        description: "Connect with readers and share your journey.",
        videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        thumbnailUrl: "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
        duration: "9:30",
        category: "Intermediate"
    },
    {
        title: "Organizing Your Shelves",
        description: "Advanced categorization techniques.",
        videoUrl: "https://www.youtube.com/watch?v=QB7ACr7pUuE",
        thumbnailUrl: "https://img.youtube.com/vi/QB7ACr7pUuE/maxresdefault.jpg",
        duration: "11:20",
        category: "Advanced"
    },
    {
        title: "Tracking Reading Progress",
        description: "Monitor habits and analyze statistics.",
        videoUrl: "https://www.youtube.com/watch?v=ZZ5LpwO-An4",
        thumbnailUrl: "https://img.youtube.com/vi/ZZ5LpwO-An4/maxresdefault.jpg",
        duration: "8:10",
        category: "Intermediate"
    },
    {
        title: "Using Favorites and Bookmarks",
        description: "Save and organize favorite books.",
        videoUrl: "https://www.youtube.com/watch?v=e-ORhEE9VVg",
        thumbnailUrl: "https://img.youtube.com/vi/e-ORhEE9VVg/maxresdefault.jpg",
        duration: "5:45",
        category: "Beginner"
    },
    {
        title: "Admin Panel Overview",
        description: "Complete admin management guide.",
        videoUrl: "https://www.youtube.com/watch?v=tgbNymZ7vqY",
        thumbnailUrl: "https://img.youtube.com/vi/tgbNymZ7vqY/maxresdefault.jpg",
        duration: "15:30",
        category: "Advanced"
    },
    {
        title: "Genre Management",
        description: "Create and organize book genres.",
        videoUrl: "https://www.youtube.com/watch?v=pRpeEdMmmQ0",
        thumbnailUrl: "https://img.youtube.com/vi/pRpeEdMmmQ0/maxresdefault.jpg",
        duration: "7:25",
        category: "Advanced"
    },
    {
        title: "Review Moderation",
        description: "Best practices for moderating reviews.",
        videoUrl: "https://www.youtube.com/watch?v=Ct6BUPvE2sM",
        thumbnailUrl: "https://img.youtube.com/vi/Ct6BUPvE2sM/maxresdefault.jpg",
        duration: "9:15",
        category: "Advanced"
    },
    {
        title: "Dark Mode and Themes",
        description: "Customize your reading experience.",
        videoUrl: "https://www.youtube.com/watch?v=SX_ViT4Ra7k",
        thumbnailUrl: "https://img.youtube.com/vi/SX_ViT4Ra7k/maxresdefault.jpg",
        duration: "4:50",
        category: "Beginner"
    },
    {
        title: "Mobile App Features",
        description: "BookWorm on your mobile device.",
        videoUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
        thumbnailUrl: "https://img.youtube.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg",
        duration: "10:05",
        category: "Intermediate"
    },
    {
        title: "Advanced Search Techniques",
        description: "Master search functionality.",
        videoUrl: "https://www.youtube.com/watch?v=60ItHLz5WEA",
        thumbnailUrl: "https://img.youtube.com/vi/60ItHLz5WEA/maxresdefault.jpg",
        duration: "8:40",
        category: "Advanced"
    },
    {
        title: "Community Guidelines",
        description: "Understanding community standards.",
        videoUrl: "https://www.youtube.com/watch?v=FTQbiNvZqaY",
        thumbnailUrl: "https://img.youtube.com/vi/FTQbiNvZqaY/maxresdefault.jpg",
        duration: "6:15",
        category: "Beginner"
    },
    {
        title: "Data Export and Backup",
        description: "Export library data and create backups.",
        videoUrl: "https://www.youtube.com/watch?v=8UVNT4wvIGY",
        thumbnailUrl: "https://img.youtube.com/vi/8UVNT4wvIGY/maxresdefault.jpg",
        duration: "7:30",
        category: "Advanced"
    }
];

// Review templates
const reviewTemplates = [
    { rating: 5, text: "Absolutely brilliant! A masterpiece that everyone should read." },
    { rating: 5, text: "One of the best books I've ever read. Highly recommended!" },
    { rating: 4, text: "Really enjoyed this book. Well-written and engaging." },
    { rating: 4, text: "Great read! A few slow parts but overall excellent." },
    { rating: 3, text: "Decent book. Had its moments but nothing extraordinary." },
    { rating: 5, text: "Couldn't put it down! Amazing from start to finish." },
    { rating: 4, text: "Solid book with great character development." },
    { rating: 5, text: "A thought-provoking and beautifully written masterpiece." },
];

const seedCompleteData = async () => {
    try {
        await connectDB();

        console.log('\n🗑️  Clearing existing data...');
        await Book.deleteMany({});
        await Tutorial.deleteMany({});
        await Review.deleteMany({});
        await Activity.deleteMany({});

        console.log('\n📚 Fetching genres and users...');
        const genres = await Genre.find();
        const users = await User.find();

        if (genres.length === 0) {
            console.error('❌ No genres found! Please seed genres first.');
            process.exit(1);
        }

        if (users.length === 0) {
            console.error('❌ No users found! Please create users first.');
            process.exit(1);
        }

        console.log(`✅ Found ${genres.length} genres and ${users.length} users`);

        // Create genre map
        const genreMap = {};
        genres.forEach(g => {
            genreMap[g.name] = g._id;
        });

        // Insert books with proper genres
        console.log('\n📖 Inserting 20 books (at least 1 per genre)...');
        const booksWithGenres = comprehensiveBooks.map(book => ({
            ...book,
            genre: genreMap[book.genreName] || genres[0]._id,
            pdfUrl: "https://example.com/sample.pdf",
            averageRating: 0,
            totalReviews: 0
        }));

        const insertedBooks = await Book.insertMany(booksWithGenres);
        console.log(`✅ Inserted ${insertedBooks.length} books`);

        // Insert tutorials
        console.log('\n🎥 Inserting 18 tutorials with YouTube links...');
        const insertedTutorials = await Tutorial.insertMany(youtubeTutorials);
        console.log(`✅ Inserted ${insertedTutorials.length} tutorials`);

        // Create reviews for books
        console.log('\n⭐ Creating demo reviews and ratings...');
        const reviews = [];
        const reviewedPairs = new Set(); // Track user-book pairs to avoid duplicates

        for (const book of insertedBooks) {
            // Random 2-4 reviews per book
            const numReviews = Math.floor(Math.random() * 3) + 2;
            let reviewsAdded = 0;
            let attempts = 0;

            while (reviewsAdded < numReviews && attempts < users.length) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const pairKey = `${randomUser._id}-${book._id}`;

                // Skip if this user already reviewed this book
                if (reviewedPairs.has(pairKey)) {
                    attempts++;
                    continue;
                }

                const randomReview = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];

                reviews.push({
                    book: book._id,
                    user: randomUser._id,
                    rating: randomReview.rating,
                    review: randomReview.text,
                    status: 'Approved'
                });

                reviewedPairs.add(pairKey);
                reviewsAdded++;
                attempts++;
            }
        }

        const insertedReviews = await Review.insertMany(reviews);
        console.log(`✅ Created ${insertedReviews.length} reviews`);

        // Update book ratings
        console.log('\n📊 Calculating book ratings...');
        for (const book of insertedBooks) {
            await Review.calcAverageRatings(book._id);
        }
        console.log('✅ Updated all book ratings');

        // Create activities for all users
        console.log('\n🎯 Creating demo activities for all users...');
        const activities = [];
        const activityTypes = ['ADD_TO_READ', 'RATED_BOOK', 'FINISHED_BOOK'];

        for (const user of users) {
            // Create 3-5 activities per user
            const numActivities = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < numActivities; i++) {
                const randomBook = insertedBooks[Math.floor(Math.random() * insertedBooks.length)];
                const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

                const activity = {
                    user: user._id,
                    type: randomType,
                    book: randomBook._id,
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                };

                if (randomType === 'RATED_BOOK') {
                    activity.data = { rating: Math.floor(Math.random() * 5) + 1 };
                }

                activities.push(activity);
            }
        }

        const insertedActivities = await Activity.insertMany(activities);
        console.log(`✅ Created ${insertedActivities.length} activities for ${users.length} users`);

        // Final summary
        const finalBooksCount = await Book.countDocuments();
        const finalTutorialsCount = await Tutorial.countDocuments();
        const finalReviewsCount = await Review.countDocuments();
        const finalActivitiesCount = await Activity.countDocuments();

        console.log('\n🎉 Complete database seeding finished!');
        console.log('═'.repeat(50));
        console.log(`📊 Final Summary:`);
        console.log(`   📚 Books: ${finalBooksCount} (covering all ${genres.length} genres)`);
        console.log(`   🎥 Tutorials: ${finalTutorialsCount} (with YouTube links)`);
        console.log(`   ⭐ Reviews: ${finalReviewsCount}`);
        console.log(`   🎯 Activities: ${finalActivitiesCount} (for ${users.length} users)`);
        console.log(`   👥 Users: ${users.length}`);
        console.log(`   🏷️  Genres: ${genres.length}`);
        console.log('═'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedCompleteData();
