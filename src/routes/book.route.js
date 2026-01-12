const express = require('express');
const bookController = require('../controllers/book.controller');
const validate = require('../middlewares/validate');
const { createBookSchema, updateBookSchema } = require('../validations/book.validation');
const { protect, restrictTo } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

/**
 * Public/User Routes (Requires login)
 */
router.get('/', protect, bookController.getAllBooks);
router.get('/:id', protect, bookController.getBookById);

/**
 * Admin Only Routes (Requires login + Admin role)
 */
router.use(protect, restrictTo('Admin'));

router.post(
    '/',
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'pdfFile', maxCount: 1 }
    ]),
    validate(createBookSchema),
    bookController.createBook
);

router.patch(
    '/:id',
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'pdfFile', maxCount: 1 }
    ]),
    validate(updateBookSchema),
    bookController.updateBook
);

router.delete('/:id', bookController.deleteBook);

module.exports = router;
