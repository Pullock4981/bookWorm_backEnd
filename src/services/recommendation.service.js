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

    // 2. Analyze user preferences from "Read" and "Currently Reading" shelves
    // This allows the system to be more proactive for users who just started
    const preferredBooks = await Library.find({
        user: userId,
        shelf: { $in: ['Read', 'Currently Reading'] }
    }).populate({
        path: 'book',
        populate: { path: 'genre' }
    });

    // --- CASE A: FALLBACK / NEW USER (Less than 3 preferred books) ---
    if (preferredBooks.length < 3) {
        const topPopular = await Book.find({
            _id: { $nin: allAddedBookIds }
        })
            .sort({ averageRating: -1, totalReviews: -1 })
            .limit(10)
            .populate('genre');

        const randomBooks = await Book.aggregate([
            { $match: { _id: { $nin: allAddedBookIds.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $sample: { size: 8 } },
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
            ...topPopular.map(b => ({
                ...b.toObject(),
                recommendationReason: "Highly rated by the BookWorm community"
            })),
            ...randomBooks.map(b => ({
                ...b,
                recommendationReason: "Discover something new and exciting"
            }))
        ];

        // Unique filter by ID
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

    // Build genre statistics
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

    // Top 2 favorite genres
    const topGenres = Object.entries(genreStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 2);

    const targetGenreIds = topGenres.map(([id]) => id);

    // Fetch genre-matched recommendations
    const recommendedBooks = await Book.find({
        genre: { $in: targetGenreIds },
        _id: { $nin: allAddedBookIds },
        averageRating: { $gte: 3.5 } // Slightly lower threshold to ensure more results
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
                ? `Matches your interest in ${stat.name} (${stat.count} books)`
                : "A high-rated choice based on your profile"
        };
    });

    // Supplement if needed
    if (personalized.length < 12) {
        const currentIds = personalized.map(b => b._id.toString());
        const extraNeeded = 18 - personalized.length;

        const generalSupplements = await Book.find({
            _id: { $nin: [...allAddedBookIds, ...currentIds] }
        })
            .sort({ averageRating: -1, totalReviews: -1 })
            .limit(extraNeeded)
            .populate('genre');

        const supplemental = generalSupplements.map(b => ({
            ...b.toObject(),
            recommendationReason: "Highly recommended globally"
        }));

        return [...personalized, ...supplemental].slice(0, 18);
    }

    return personalized;
};

module.exports = {
    getPersonalizedRecommendations
};
