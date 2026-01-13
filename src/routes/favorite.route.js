const express = require('express');
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All favorite routes require login

router.get('/', favoriteController.getMyFavorites);
router.post('/toggle', favoriteController.toggleFavorite);
router.get('/check/:bookId', favoriteController.checkFavoriteStatus);

module.exports = router;
