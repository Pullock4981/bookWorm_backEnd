const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Favorite must belong to a user']
    },
    book: {
        type: mongoose.Schema.ObjectId,
        ref: 'Book',
        required: [true, 'Favorite must belong to a book']
    }
}, {
    timestamps: true
});

// Prevent duplicate favorites (1 user can favorite 1 book only once)
favoriteSchema.index({ user: 1, book: 1 }, { unique: true });



const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
