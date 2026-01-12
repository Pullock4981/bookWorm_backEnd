const genreService = require('../services/genre.service');

const createGenre = async (req, res) => {
    try {
        const { name } = req.body;
        const genre = await genreService.createGenre(name);
        res.status(201).json({
            status: 'success',
            data: genre
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getAllGenres = async (req, res) => {
    try {
        const genres = await genreService.getAllGenres();
        res.status(200).json({
            status: 'success',
            results: genres.length,
            data: genres
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const updateGenre = async (req, res) => {
    try {
        const genre = await genreService.updateGenre(req.params.id, req.body.name);
        res.status(200).json({
            status: 'success',
            data: genre
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
};

const deleteGenre = async (req, res) => {
    try {
        await genreService.deleteGenre(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {
    createGenre,
    getAllGenres,
    updateGenre,
    deleteGenre
};
