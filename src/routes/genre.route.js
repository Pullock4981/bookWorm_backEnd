const express = require('express');
const genreController = require('../controllers/genre.controller');
const validate = require('../middlewares/validate');
const { createGenreSchema, updateGenreSchema } = require('../validations/genre.validation');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// Public users can see genres
router.get('/', protect, genreController.getAllGenres);

// Only Admin can manage genres
router.use(protect, restrictTo('Admin'));

router.post('/', validate(createGenreSchema), genreController.createGenre);
router.patch('/:id', validate(updateGenreSchema), genreController.updateGenre);
router.delete('/:id', genreController.deleteGenre);

module.exports = router;
