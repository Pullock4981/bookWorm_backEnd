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
    // 1. Get user's full library
    // The Library model has a pre-find hook that populates 'book'
    const userLibrary = await Library.find({ user: userId });

    // Safety check: extract actual IDs even if populated
    const allAddedBookIds = userLibrary
        .map(item => item.book && item.book._id ? item.book._id.toString() : item.book?.toString())
        .filter(id => id && mongoose.Types.ObjectId.isValid(id));

    // 2. Analyze user preferences primarily from "Read" shelf
    const readBooks = await Library.find({
        user: userId,
        shelf: 'Read'
    }).populate({
        path: 'book',
        populate: { path: 'genre' }
    });

    // Also consider "Currently Reading" but with less weight if needed, 
    // but for genre frequency, we'll stick to 'Read' as requested.
    const preferredBooks = readBooks.length >= 3 ? readBooks : await Library.find({
        user: userId,
        shelf: { $in: ['Read', 'Currently Reading'] }
    }).populate({
        path: 'book',
        populate: { path: 'genre' }
    });

    // --- CASE A: FALLBACK / NEW USER (< 3 preferred books) ---
    if (preferredBooks.length < 3) {
        // Most added to shelves (popularity) + Top average rating
        const popularBooks = await Book.find({
            _id: { $nin: allAddedBookIds }
        })
            .sort({ averageRating: -1, totalReviews: -1 })
            .limit(12)
            .populate('genre');

        const randomBooks = await Book.aggregate([
            { $match: { _id: { $nin: allAddedBookIds.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $sample: { size: 6 } },
            {
                $lookup: {
                    from: 'genres',
                    localField: 'genre',
                    foreignField: '_id',
                    as: 'genre'
                }
            },
            { $unwind: '$genre' }
        ]);

        const merged = [
            ...popularBooks.map(b => ({
                ...b.toObject(),
                recommendationReason: "Highly rated by the community"
            })),
            ...randomBooks.map(b => ({
                ...b,
                recommendationReason: "A fresh discovery for you"
            }))
        ];

        // Unique filter
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
    const genreStats = {};
    preferredBooks.forEach(item => {
        if (!item.book || !item.book.genre) return;
        const g = item.book.genre;
        const gId = g._id.toString();
        if (!genreStats[gId]) {
            genreStats[gId] = { name: g.name, count: 0 };
        }
        genreStats[gId].count += 1;
    });

    const topGenres = Object.entries(genreStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3); // Top 3 genres

    const targetGenreIds = topGenres.map(([id]) => id);

    // Fetch genre-matched recommendations, sorted by rating and popularity
    const recommendedBooks = await Book.find({
        genre: { $in: targetGenreIds },
        _id: { $nin: allAddedBookIds },
        averageRating: { $gte: 3.0 }
    })
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(18)
        .populate('genre');

    const personalized = recommendedBooks.map(book => {
        const genreId = book.genre._id.toString();
        const stat = genreStats[genreId];
        return {
            ...book.toObject(),
            recommendationReason: stat
                ? `Matches your preference for ${stat.name} (${stat.count} books read)`
                : "A top choice in a genre you enjoy"
        };
    });

    // Supplement if less than 12
    if (personalized.length < 12) {
        const currentIds = personalized.map(b => b._id.toString());
        const extraNeeded = 18 - personalized.length;

        const globalPicks = await Book.find({
            _id: { $nin: [...allAddedBookIds, ...currentIds] }
        })
            .sort({ averageRating: -1, totalReviews: -1 })
            .limit(extraNeeded)
            .populate('genre');

        const supplemental = globalPicks.map(b => ({
            ...b.toObject(),
            recommendationReason: "A community-approved popular pick"
        }));

        return [...personalized, ...supplemental].slice(0, 18);
    }

    return personalized.slice(0, 18);
};

module.exports = {
    getPersonalizedRecommendations
};
