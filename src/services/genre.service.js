const Genre = require('../models/Genre');

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
