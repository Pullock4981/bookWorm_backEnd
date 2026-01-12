const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./src/models/Book');
const Genre = require('./src/models/Genre');

dotenv.config();

const demoBooks = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        genreName: "Fiction",
        averageRating: 4.5,
        totalReviews: 120
    },
    {
        title: "Dune",
        author: "Frank Herbert",
        description: "Dune is a 1965 epic science fiction novel by American author Frank Herbert. Set on the desert planet Arrakis, it tells the story of the boy Paul Atreides, scion of a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        genreName: "Science Fiction",
        averageRating: 4.8,
        totalReviews: 350
    },
    {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        description: "Sapiens: A Brief History of Humankind is a book by Yuval Noah Harari, first published in Hebrew in Israel in 2011 based on a series of lectures Harari taught at The Hebrew University of Jerusalem, and in English in 2014.",
        coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        genreName: "History",
        averageRating: 4.7,
        totalReviews: 210
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
        coverImage: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=800",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        genreName: "Self-Help",
        averageRating: 4.9,
        totalReviews: 500
    },
    {
        title: "Steve Jobs",
        author: "Walter Isaacson",
        description: "Steve Jobs is the authorized self-titled biography of American business magnate and Apple co-founder Steve Jobs. The book was written at the request of Jobs by Walter Isaacson, a former executive at CNN and TIME who has written best-selling biographies of Benjamin Franklin and Albert Einstein.",
        coverImage: "https://images.unsplash.com/photo-1531297461136-82lw8fca39d3?auto=format&fit=crop&q=80&w=800", // Tech/Bio placeholder
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        genreName: "Biography",
        averageRating: 4.6,
        totalReviews: 180
    }
];

const seedBooks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing books if needed? Maybe better not to delete user data. 
        // But for "demo data" usually we append or ensure no dupes.
        // Let's just append but check if exists by title.

        const genres = await Genre.find();
        if (genres.length === 0) {
            console.log('No genres found. Please run seedGenres.js first.');
            process.exit(1);
        }

        let addedCount = 0;

        for (const book of demoBooks) {
            // Find genre ID
            const genre = genres.find(g => g.name === book.genreName) || genres[0];

            // Check if book exists
            const exists = await Book.findOne({ title: book.title });
            if (!exists) {
                await Book.create({
                    ...book,
                    genre: genre._id
                });
                console.log(`Added: ${book.title}`);
                addedCount++;
            } else {
                console.log(`Skipped (Exists): ${book.title}`);
            }
        }

        console.log(`✅ Seeding complete! Added ${addedCount} new books.`);
        process.exit();
    } catch (error) {
        console.error('Error seeding books:', error);
        process.exit(1);
    }
};

seedBooks();
