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

    // 2. Analyze user preferences from "Read" and "Currently Reading"
    const preferredBooks = userLibrary.filter(item =>
        ['Read', 'Currently Reading'].includes(item.shelf)
    );

    // --- CASE A: FALLBACK / NEW USER (< 3 preferred books) ---
    if (preferredBooks.length < 3) {
        const [popularBooks, randomBooks] = await Promise.all([
            Book.find({ _id: { $nin: allAddedBookIds } })
                .sort({ averageRating: -1, totalReviews: -1 })
                .limit(12)
                .select('title author coverImage genre averageRating totalReviews')
                .populate('genre', 'name')
                .lean(),
            Book.aggregate([
                { $match: { _id: { $nin: allAddedBookIds.map(id => new mongoose.Types.ObjectId(id)) } } },
                { $sample: { size: 6 } },
                { $lookup: { from: 'genres', localField: 'genre', foreignField: '_id', as: 'genre' } },
                { $unwind: '$genre' },
                { $project: { title: 1, author: 1, coverImage: 1, 'genre.name': 1, averageRating: 1, totalReviews: 1 } }
            ])
        ]);

        const merged = [
            ...popularBooks.map(b => ({
                ...b,
                recommendationReason: "Highly rated by the community"
            })),
            ...randomBooks.map(b => ({
                ...b,
                recommendationReason: "A fresh discovery for you"
            }))
        ];

        // Unique filter (just in case)
        const unique = [];
        const seen = new Set();
        for (const item of merged) {
            const idStr = item._id.toString();
            if (!seen.has(idStr)) {
                seen.add(idStr);
                unique.push(item);
            }
        }

        return unique.slice(0, 18);
    }

    // --- CASE B: PERSONALIZED (>= 3 preferred books) ---
    // Extract genre IDs from preferred books (need to populate if not already there, 
    // but we can query them efficiently)
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
            genreStats[gId] = { name: book.genre.name, count: 0 };
        }
        genreStats[gId].count += 1;
    });

    const topGenres = Object.entries(genreStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3);

    const targetGenreIds = topGenres.map(([id]) => id);

    const recommendedBooks = await Book.find({
        genre: { $in: targetGenreIds },
        _id: { $nin: allAddedBookIds },
        averageRating: { $gte: 3.0 }
    })
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(18)
        .select('title author coverImage genre averageRating totalReviews')
        .populate('genre', 'name')
        .lean();

    const personalized = recommendedBooks.map(book => {
        const genreId = book.genre._id.toString();
        const stat = genreStats[genreId];
        return {
            ...book,
            recommendationReason: stat
                ? `Matches your preference for ${stat.name} (${stat.count} books read)`
                : "A top choice in a genre you enjoy"
        };
    });

    if (personalized.length < 12) {
        const currentIds = personalized.map(b => b._id.toString());
        const extraPicks = await Book.find({
            _id: { $nin: [...allAddedBookIds, ...currentIds] }
        })
            .sort({ averageRating: -1, totalReviews: -1 })
            .limit(18 - personalized.length)
            .select('title author coverImage genre averageRating totalReviews')
            .populate('genre', 'name')
            .lean();

        const supplemental = extraPicks.map(b => ({
            ...b,
            recommendationReason: "A community-approved popular pick"
        }));

        return [...personalized, ...supplemental].slice(0, 18);
    }

    return personalized.slice(0, 18);
};

module.exports = {
    getPersonalizedRecommendations
};
