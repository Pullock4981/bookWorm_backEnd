const Library = require('../models/Library');
const Goal = require('../models/Goal');
const Review = require('../models/Review');
const User = require('../models/User');
const Book = require('../models/Book');

/**
 * Service to calculate and retrieve user reading statistics
 */

/**
 * Aggregates all reading metrics for a user
 * @param {string} userId - User ID
 */
const getUserStats = async (userId) => {
    const currentYear = new Date().getFullYear();

    // 1. Parallelize fetches and use lean() for performance
    const [libraryItems, userReviews, goal] = await Promise.all([
        Library.find({ user: userId }).populate({
            path: 'book',
            select: 'genre' // Only need genre for stats
        }).lean(),
        Review.find({ user: userId }).select('rating').lean(),
        Goal.findOne({ user: userId, year: currentYear }).lean()
    ]);

    // Books read THIS year
    const booksReadThisYear = libraryItems.filter(item =>
        item.shelf === 'Read' &&
        new Date(item.updatedAt).getFullYear() === currentYear
    ).length;

    // Total pages read from all books
    const totalPagesRead = libraryItems.reduce((acc, item) => acc + (item.pagesRead || 0), 0);

    // Total books read overall
    const totalBooksRead = libraryItems.filter(item => item.shelf === 'Read').length;

    // 2. Average rating given
    const avgRatingGiven = userReviews.length > 0
        ? userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length
        : 0;

    // 3. Favorite genre breakdown
    const genreCounts = {};
    libraryItems.forEach(item => {
        if (item.book && item.book.genre) {
            const genreName = item.book.genre.name;
            genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
        }
    });
    const genreBreakdown = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));

    // 4. Monthly reading progress
    const monthlyStats = Array(12).fill(0).map((_, i) => ({
        month: new Date(0, i).toLocaleString('en', { month: 'short' }),
        count: 0
    }));

    libraryItems.forEach(item => {
        if (item.shelf === 'Read' && new Date(item.updatedAt).getFullYear() === currentYear) {
            const monthIndex = new Date(item.updatedAt).getMonth();
            monthlyStats[monthIndex].count += 1;
        }
    });

    return {
        booksReadThisYear,
        totalBooksRead,
        totalPagesRead,
        avgRatingGiven: parseFloat(avgRatingGiven.toFixed(1)),
        genreBreakdown,
        monthlyStats,
        goal: goal ? { target: goal.targetCount, current: booksReadThisYear, year: currentYear } : null
    };
};

/**
 * Sets or updates a user's reading goal for the current year
 * @param {string} userId - User ID
 * @param {number} targetCount - Target number of books
 */
const setGoal = async (userId, targetCount) => {
    const year = new Date().getFullYear();
    return await Goal.findOneAndUpdate(
        { user: userId, year },
        { targetCount },
        { upsert: true, new: true, runValidators: true }
    );
};

/**
 * Retrieves system-wide statistics for the Admin Dashboard
 */
const getAdminStats = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    // 1. Run all counts and aggregations in parallel
    const [totalUsers, activeBooks, pendingReviews, booksByGenre, usersByMonth] = await Promise.all([
        User.countDocuments().lean(),
        Book.countDocuments().lean(),
        Review.countDocuments({ status: 'Pending' }).lean(),
        Book.aggregate([
            { $lookup: { from: 'genres', localField: 'genre', foreignField: '_id', as: 'genreInfo' } },
            { $unwind: '$genreInfo' },
            { $group: { _id: '$genreInfo.name', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } },
            { $sort: { value: -1 } },
            { $limit: 5 }
        ]),
        User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
    ]);

    const systemHealth = '98%';

    // Generate last 6 months array to ensure no gaps
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last6Months = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        last6Months.push({
            monthIndex: d.getMonth() + 1,
            year: d.getFullYear(),
            name: monthNames[d.getMonth()]
        });
    }

    const formattedUserGrowth = last6Months.map(monthCtx => {
        const found = usersByMonth.find(u => u._id.month === monthCtx.monthIndex && u._id.year === monthCtx.year);
        return {
            name: monthCtx.name,
            users: found ? found.count : 0
        };
    });

    return {
        totalUsers,
        activeBooks,
        pendingReviews,
        systemHealth,
        charts: {
            booksByGenre,
            userGrowth: formattedUserGrowth
        }
    };
};

module.exports = {
    getUserStats,
    setGoal,
    getAdminStats
};
