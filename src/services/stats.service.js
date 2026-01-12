const Library = require('../models/Library');
const Goal = require('../models/Goal');
const Review = require('../models/Review');

/**
 * Service to calculate and retrieve user reading statistics
 */

/**
 * Aggregates all reading metrics for a user
 * @param {string} userId - User ID
 */
const getUserStats = async (userId) => {
    const currentYear = new Date().getFullYear();

    // 1. Get Library data
    const libraryItems = await Library.find({ user: userId }).populate('book');

    // Books read THIS year (using updatedAt when shelf is 'Read')
    const booksReadThisYear = libraryItems.filter(item =>
        item.shelf === 'Read' &&
        new Date(item.updatedAt).getFullYear() === currentYear
    ).length;

    // Total pages read from all books
    const totalPagesRead = libraryItems.reduce((acc, item) => acc + (item.pagesRead || 0), 0);

    // Total books read overall
    const totalBooksRead = libraryItems.filter(item => item.shelf === 'Read').length;

    // 2. Average rating given by the user
    const userReviews = await Review.find({ user: userId });
    const avgRatingGiven = userReviews.length > 0
        ? userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length
        : 0;

    // 3. Favorite genre breakdown (for Pie Chart)
    const genreCounts = {};
    libraryItems.forEach(item => {
        if (item.book && item.book.genre) {
            const genreName = item.book.genre.name;
            genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
        }
    });
    const genreBreakdown = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));

    // 4. Monthly reading progress (for Bar Chart)
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

    // 5. Reading Goal
    const goal = await Goal.findOne({ user: userId, year: currentYear });

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

module.exports = {
    getUserStats,
    setGoal
};
