const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A genre must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A genre name must have less or equal than 40 characters'],
        minlength: [2, 'A genre name must have more or equal than 2 characters']
    }
}, {
    timestamps: true
});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
