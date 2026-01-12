const express = require('express');
const libraryController = require('../controllers/library.controller');
const validate = require('../middlewares/validate');
const { addToLibrarySchema, updateProgressSchema } = require('../validations/library.validation');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All library routes require authentication
router.use(protect);

router.get('/', libraryController.getMyLibrary);
router.post('/add', validate(addToLibrarySchema), libraryController.addToLibrary);
router.patch('/progress/:id', validate(updateProgressSchema), libraryController.updateProgress);
router.delete('/:id', libraryController.removeFromLibrary);

module.exports = router;
