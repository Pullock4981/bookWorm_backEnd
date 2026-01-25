const Library = require('../models/Library');
const Book = require('../models/Book');
const mongoose = require('mongoose');

/**
 * Service to handle Personalized Book Recommendations logic
 * Following strict business requirements for deterministic and high-quality results.
 */

/**
 * Generates book recommendations based on the user's "Read" history
 * @param {string} userId - The unique ID of the user
 */
const getPersonalizedRecommendations = async (userId) => {
    // 1. Get user's full library (IDs only for filtering) - Use lean and select for speed
    const userLibrary = await Library.find({ user: userId }).select('book shelf').lean();

    const allAddedBookIds = userLibrary
        .map(item => item.book?.toString())
        .filter(id => id && mongoose.Types.ObjectId.isValid(id));

    // 2. Analyze user preferences from ALL shelves (Read, Reading, Want to Read)
    // This captures intent even if they haven't started reading yet.
    const preferredBooks = userLibrary.filter(item =>
        ['Read', 'Currently Reading', 'Want to Read'].includes(item.shelf)
    );

    // --- CASE A: FALLBACK / NEW USER (< 1 preferred book) ---
    // User Request: "jodi favourite e kunu genra na thake taile oi genra er book show koiro nah"
    // Meaning: If no data, show NOTHING. Let the frontend show "Analyzing..." state.
    if (preferredBooks.length < 1) {
        return [];
    }

    // --- CASE B: PERSONALIZED (>= 1 preferred book) ---
    // Extract genre IDs from preferred books
    const preferredBookIds = preferredBooks.map(p => p.book);
    const populatedPreferred = await Book.find({ _id: { $in: preferredBookIds } })
        .select('genre')
        .populate('genre', 'name')
        .lean();

    const genreStats = {};
    populatedPreferred.forEach(book => {
        if (!book.genre) return;
        const gId = book.genre._id.toString();
        if (!genreStats[gId]) {
            genreStats[gId] = { name: book.genre.name, count: 0, id: gId };
        }
        genreStats[gId].count += 1;
    });

    // Sort genres by frequency (most read first)
    const sortedGenres = Object.values(genreStats).sort((a, b) => b.count - a.count);

    if (sortedGenres.length === 0) return []; // Should not happen based on check above

    const topGenre = sortedGenres[0]; // The winner

    // Strategy: Fetch books from Top Genre FIRST.
    // We want to fill the view (approx 8-10 books) with the User's #1 fav genre if possible.

    let recommendations = [];
    const booksNeeded = 18; // Fetch buffer

    // 1. Fetch Top Genre Books
    const topGenreBooks = await Book.find({
        genre: topGenre.id,
        _id: { $nin: allAddedBookIds }
    })
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(booksNeeded)
        .select('title author coverImage genre averageRating totalReviews')
        .populate('genre', 'name')
        .lean();

    recommendations = topGenreBooks.map(b => ({
        ...b,
        recommendationReason: `Because you read ${topGenre.count} ${topGenre.name} books`
    }));

    // 2. If we still need more books, try secondary genres
    // STRICT MODE: Only fetch from genres user has actually read/interacted with.
    if (recommendations.length < booksNeeded && sortedGenres.length > 1) {
        const remainingSpace = booksNeeded - recommendations.length;
        // Take next best genres (up to 3 more to avoid noise)
        const secondaryGenreIds = sortedGenres.slice(1, 4).map(g => g.id);
        const existingIds = [...allAddedBookIds, ...recommendations.map(b => b._id)];

        const secondaryBooks = await Book.find({
            genre: { $in: secondaryGenreIds },
            _id: { $nin: existingIds }
        })
            .sort({ averageRating: -1, totalReviews: -1 })
            .limit(remainingSpace)
            .select('title author coverImage genre averageRating totalReviews')
            .populate('genre', 'name')
            .lean();

        recommendations = [...recommendations, ...secondaryBooks.map(b => ({
            ...b,
            recommendationReason: "From other genres you enjoy"
        }))];
    }

    // 3. NO FALLBACK TO RANDOM POPULAR BOOKS.
    // As per user request: "jodi favourite e kunu genra na thake taile oi genra er book show koiro nah"
    // We only return what matches their history. If it's short (e.g. 2 books), so be it.

    return recommendations.slice(0, 18);
};

module.exports = {
    getPersonalizedRecommendations
};
