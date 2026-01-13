require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./src/models/Book');
const Genre = require('./src/models/Genre');
const Tutorial = require('./src/models/Tutorial');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// Additional 20 Demo Books
const additionalBooks = [
    {
        title: "The Midnight Library",
        author: "Matt Haig",
        description: "Between life and death there is a library, and within that library, the shelves go on forever.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        pdfUrl: "https://example.com/midnight-library.pdf",
        totalPages: 304,
        averageRating: 4.5,
        totalReviews: 234
    },
    {
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        description: "A coming-of-age story set in the marshes of North Carolina.",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        pdfUrl: "https://example.com/crawdads.pdf",
        totalPages: 384,
        averageRating: 4.6,
        totalReviews: 412
    },
    {
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        description: "Aging Hollywood icon Evelyn Hugo finally tells the truth about her glamorous and scandalous life.",
        coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
        pdfUrl: "https://example.com/evelyn-hugo.pdf",
        totalPages: 400,
        averageRating: 4.7,
        totalReviews: 389
    },
    {
        title: "Project Hail Mary",
        author: "Andy Weir",
        description: "A lone astronaut must save the earth from disaster in this gripping sci-fi thriller.",
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
        pdfUrl: "https://example.com/hail-mary.pdf",
        totalPages: 496,
        averageRating: 4.8,
        totalReviews: 456
    },
    {
        title: "The Song of Achilles",
        author: "Madeline Miller",
        description: "A reimagining of Homer's Iliad told from the perspective of Patroclus.",
        coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400",
        pdfUrl: "https://example.com/achilles.pdf",
        totalPages: 352,
        averageRating: 4.6,
        totalReviews: 367
    },
    {
        title: "Circe",
        author: "Madeline Miller",
        description: "The story of the sorceress from Greek mythology who transforms men into pigs.",
        coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400",
        pdfUrl: "https://example.com/circe.pdf",
        totalPages: 400,
        averageRating: 4.5,
        totalReviews: 334
    },
    {
        title: "The Invisible Life of Addie LaRue",
        author: "V.E. Schwab",
        description: "A woman makes a Faustian bargain to live forever but is cursed to be forgotten by everyone.",
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
        pdfUrl: "https://example.com/addie-larue.pdf",
        totalPages: 448,
        averageRating: 4.4,
        totalReviews: 298
    },
    {
        title: "The Martian",
        author: "Andy Weir",
        description: "An astronaut becomes stranded on Mars and must use his ingenuity to survive.",
        coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400",
        pdfUrl: "https://example.com/martian.pdf",
        totalPages: 369,
        averageRating: 4.7,
        totalReviews: 523
    },
    {
        title: "The Kite Runner",
        author: "Khaled Hosseini",
        description: "A powerful story of friendship, betrayal, and redemption set in Afghanistan.",
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
        pdfUrl: "https://example.com/kite-runner.pdf",
        totalPages: 371,
        averageRating: 4.6,
        totalReviews: 445
    },
    {
        title: "A Thousand Splendid Suns",
        author: "Khaled Hosseini",
        description: "Two women's lives intertwine in war-torn Afghanistan.",
        coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
        pdfUrl: "https://example.com/thousand-suns.pdf",
        totalPages: 432,
        averageRating: 4.7,
        totalReviews: 412
    },
    {
        title: "The Book Thief",
        author: "Markus Zusak",
        description: "Death narrates the story of a young girl in Nazi Germany who steals books.",
        coverImage: "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=400",
        pdfUrl: "https://example.com/book-thief.pdf",
        totalPages: 584,
        averageRating: 4.8,
        totalReviews: 567
    },
    {
        title: "The Nightingale",
        author: "Kristin Hannah",
        description: "Two sisters in France during World War II struggle to survive and resist the Nazis.",
        coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
        pdfUrl: "https://example.com/nightingale.pdf",
        totalPages: 440,
        averageRating: 4.7,
        totalReviews: 489
    },
    {
        title: "All the Light We Cannot See",
        author: "Anthony Doerr",
        description: "A blind French girl and a German boy's paths collide in occupied France.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        pdfUrl: "https://example.com/all-light.pdf",
        totalPages: 531,
        averageRating: 4.6,
        totalReviews: 501
    },
    {
        title: "The Handmaid's Tale",
        author: "Margaret Atwood",
        description: "A dystopian novel about a totalitarian society where women are subjugated.",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        pdfUrl: "https://example.com/handmaids-tale.pdf",
        totalPages: 311,
        averageRating: 4.5,
        totalReviews: 423
    },
    {
        title: "The Hunger Games",
        author: "Suzanne Collins",
        description: "In a dystopian future, teens are forced to fight to the death on live television.",
        coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
        pdfUrl: "https://example.com/hunger-games.pdf",
        totalPages: 374,
        averageRating: 4.6,
        totalReviews: 612
    },
    {
        title: "The Fault in Our Stars",
        author: "John Green",
        description: "Two teens with cancer fall in love and embark on a life-changing journey.",
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
        pdfUrl: "https://example.com/fault-stars.pdf",
        totalPages: 313,
        averageRating: 4.4,
        totalReviews: 534
    },
    {
        title: "The Giver",
        author: "Lois Lowry",
        description: "A boy discovers the dark truth behind his seemingly perfect society.",
        coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400",
        pdfUrl: "https://example.com/giver.pdf",
        totalPages: 240,
        averageRating: 4.3,
        totalReviews: 389
    },
    {
        title: "Ready Player One",
        author: "Ernest Cline",
        description: "In a dystopian future, a teen searches for an Easter egg in a virtual reality world.",
        coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400",
        pdfUrl: "https://example.com/ready-player-one.pdf",
        totalPages: 374,
        averageRating: 4.5,
        totalReviews: 467
    },
    {
        title: "The Name of the Wind",
        author: "Patrick Rothfuss",
        description: "A legendary hero tells his own story in this epic fantasy tale.",
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
        pdfUrl: "https://example.com/name-wind.pdf",
        totalPages: 662,
        averageRating: 4.7,
        totalReviews: 512
    },
    {
        title: "The Way of Kings",
        author: "Brandon Sanderson",
        description: "The first book in an epic fantasy series set in a world of storms and magic.",
        coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400",
        pdfUrl: "https://example.com/way-kings.pdf",
        totalPages: 1007,
        averageRating: 4.8,
        totalReviews: 589
    }
];

// Additional Tutorials (15-18)
const additionalTutorials = [
    {
        title: "Speed Reading Techniques",
        description: "Learn proven methods to increase your reading speed while maintaining comprehension.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "14:25",
        category: "Advanced"
    },
    {
        title: "Building Reading Habits",
        description: "Practical strategies to develop a consistent daily reading routine.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "9:40",
        category: "Beginner"
    },
    {
        title: "Note-Taking While Reading",
        description: "Effective methods for capturing key insights and ideas from books.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "11:30",
        category: "Intermediate"
    },
    {
        title: "Creating Book Summaries",
        description: "How to distill books into concise, actionable summaries.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "8:55",
        category: "Intermediate"
    },
    {
        title: "Reading Across Genres",
        description: "Expand your literary horizons by exploring different book genres.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "10:20",
        category: "Beginner"
    },
    {
        title: "Book Club Best Practices",
        description: "Tips for running engaging and productive book club discussions.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "12:45",
        category: "Intermediate"
    },
    {
        title: "Digital vs Physical Reading",
        description: "Comparing the benefits and drawbacks of different reading formats.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "7:15",
        category: "Beginner"
    },
    {
        title: "Memory Retention Strategies",
        description: "Techniques to remember more of what you read.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "13:10",
        category: "Advanced"
    },
    {
        title: "Critical Reading Skills",
        description: "Develop analytical thinking while reading complex texts.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "15:35",
        category: "Advanced"
    },
    {
        title: "Reading for Different Purposes",
        description: "Adapt your reading strategy based on your goals.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "9:50",
        category: "Intermediate"
    },
    {
        title: "Overcoming Reading Slumps",
        description: "Strategies to reignite your passion for reading when motivation is low.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "8:30",
        category: "Beginner"
    },
    {
        title: "Advanced Search Filters",
        description: "Master BookWorm's powerful search and filtering capabilities.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "10:45",
        category: "Advanced"
    },
    {
        title: "Reading Analytics Dashboard",
        description: "Understanding and using your reading statistics effectively.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "11:20",
        category: "Intermediate"
    },
    {
        title: "Sharing Book Recommendations",
        description: "How to recommend books to friends and build your reading network.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "6:55",
        category: "Beginner"
    },
    {
        title: "Privacy and Security Settings",
        description: "Manage your account privacy and security preferences.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "7:40",
        category: "Intermediate"
    },
    {
        title: "Customizing Your Profile",
        description: "Personalize your BookWorm profile to reflect your reading personality.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "5:25",
        category: "Beginner"
    },
    {
        title: "BookWorm API Integration",
        description: "For developers: integrate BookWorm with external applications.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "18:15",
        category: "Advanced"
    }
];

const seedAdditionalData = async () => {
    try {
        await connectDB();

        console.log('📚 Fetching existing data...');
        const existingBooksCount = await Book.countDocuments();
        const existingTutorialsCount = await Tutorial.countDocuments();
        const genres = await Genre.find();

        if (genres.length === 0) {
            console.error('❌ No genres found! Please seed genres first.');
            process.exit(1);
        }

        console.log(`✅ Current database state:`);
        console.log(`   - Existing Books: ${existingBooksCount}`);
        console.log(`   - Existing Tutorials: ${existingTutorialsCount}`);
        console.log(`   - Genres: ${genres.length}`);

        // Assign random genres to new books
        const booksWithGenres = additionalBooks.map(book => ({
            ...book,
            genre: genres[Math.floor(Math.random() * genres.length)]._id
        }));

        console.log('\n📖 Adding 20 new books...');
        const insertedBooks = await Book.insertMany(booksWithGenres);
        console.log(`✅ Successfully added ${insertedBooks.length} new books`);

        console.log('\n🎥 Adding 17 new tutorials...');
        const insertedTutorials = await Tutorial.insertMany(additionalTutorials);
        console.log(`✅ Successfully added ${insertedTutorials.length} new tutorials`);

        const finalBooksCount = await Book.countDocuments();
        const finalTutorialsCount = await Tutorial.countDocuments();

        console.log('\n🎉 Database update completed successfully!');
        console.log(`📊 Final Summary:`);
        console.log(`   - Total Books: ${finalBooksCount} (added ${insertedBooks.length})`);
        console.log(`   - Total Tutorials: ${finalTutorialsCount} (added ${insertedTutorials.length})`);
        console.log(`   - Genres: ${genres.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedAdditionalData();
