const Tutorial = require('../models/Tutorial');

/**
 * Service to handle Tutorial business logic
 */

/**
 * Creates a new tutorial
 * @param {Object} tutorialData - Title, Video URL, Description
 */
const createTutorial = async (tutorialData) => {
    return await Tutorial.create(tutorialData);
};

/**
 * Fetches all tutorials from the database
 */
const getAllTutorials = async () => {
    return await Tutorial.find().sort('-createdAt');
};

/**
 * Updates an existing tutorial
 */
const updateTutorial = async (id, updateData) => {
    const tutorial = await Tutorial.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
    if (!tutorial) throw new Error('Tutorial not found');
    return tutorial;
};

/**
 * Deletes a tutorial
 */
const deleteTutorial = async (id) => {
    const tutorial = await Tutorial.findByIdAndDelete(id);
    if (!tutorial) throw new Error('Tutorial not found');
    return tutorial;
};

module.exports = {
    createTutorial,
    getAllTutorials,
    updateTutorial,
    deleteTutorial
};
