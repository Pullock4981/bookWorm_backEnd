const Library = require('../models/Library');
const Book = require('../models/Book');

/**
 * Service to handle Personalized Book Recommendations logic
 */

/**
 * Generates book recommendations based on the user's reading history
 * @param {string} userId - The unique ID of the user
 */
const getPersonalizedRecommendations = async (userId) => {
    // 1. Get user's reading history (Read and Currently Reading books)
    const userLibrary = await Library.find({ user: userId }).populate('book');
    const libraryBookIds = userLibrary.map(item => item.book._id.toString());

    // 2. Analyze favorite genres
    const relevantBooks = userLibrary.filter(item =>
        ['Read', 'Currently Reading'].includes(item.shelf)
    );

    const genreFrequency = {};
    relevantBooks.forEach(item => {
        const genreId = item.book.genre._id.toString();
        const genreName = item.book.genre.name;
        if (!genreFrequency[genreId]) {
            genreFrequency[genreId] = { count: 0, name: genreName };
        }
        genreFrequency[genreId].count += 1;
    });

    // Sort genres by frequency to find top interests
    const sortedGenres = Object.entries(genreFrequency)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3); // Get top 3 genres

    const favoriteGenreIds = sortedGenres.map(([id]) => id);

    // 3. Find recommended books in those genres that the user hasn't added yet
    let recommendations = [];

    if (favoriteGenreIds.length > 0) {
        recommendations = await Book.find({
            genre: { $in: favoriteGenreIds },
            _id: { $not: { $in: libraryBookIds } }
        })
            .sort('-averageRating -totalReviews')
            .limit(15);

        // Add a "Recommendation Reason" to each book
        recommendations = recommendations.map(book => {
            const genreInfo = genreFrequency[book.genre._id.toString()];
            const bookObj = book.toObject();
            bookObj.recommendationReason = `Based on your interest in ${genreInfo ? genreInfo.name : 'similar books'}`;
            return bookObj;
        });
    }

    // 4. Fallback: If no history or not enough recommendations, add generally popular books
    if (recommendations.length < 5) {
        const popularBooks = await Book.find({
            _id: { $not: { $in: [...libraryBookIds, ...recommendations.map(r => r._id.toString())] } }
        })
            .sort('-averageRating -totalReviews')
            .limit(10);

        const popularWithReason = popularBooks.map(book => {
            const bookObj = book.toObject();
            bookObj.recommendationReason = `Popular choice with ${book.averageRating.toFixed(1)} rating`;
            return bookObj;
        });

        recommendations = [...recommendations, ...popularWithReason];
    }

    return recommendations.slice(0, 15);
};

module.exports = {
    getPersonalizedRecommendations
};
