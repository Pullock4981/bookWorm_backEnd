const Genre = require('../models/Genre');
const Book = require('../models/Book');

/**
 * Logic for Genre Operations
 */

/**
 * Creates a new genre if it doesn't already exist
 * @param {string} name 
 */
const createGenre = async (name) => {

    const genreExists = await Genre.findOne({ name });
    if (genreExists) {
        throw new Error('Genre already exists');
    }
    return await Genre.create({ name });
};

const getAllGenres = async () => {
    return await Genre.find().sort('name');
};

const updateGenre = async (id, name) => {
    const genre = await Genre.findByIdAndUpdate(id, { name }, {
        new: true,
        runValidators: true
    });
    if (!genre) throw new Error('Genre not found');
    return genre;
};

const deleteGenre = async (id) => {
    // Check if any books are associated with this genre
    const booksCount = await Book.countDocuments({ genre: id });
    if (booksCount > 0) {
        throw new Error(`Cannot delete genre. It is associated with ${booksCount} book(s).`);
    }

    const genre = await Genre.findByIdAndDelete(id);
    if (!genre) throw new Error('Genre not found');
    return genre;
};

module.exports = {
    createGenre,
    getAllGenres,
    updateGenre,
    deleteGenre
};
