const tutorialService = require('../services/tutorial.service');

/**
 * Controller to handle Tutorial related HTTP requests/responses
 */

/**
 * Handles tutorial creation (Admin only)
 */
const createTutorial = async (req, res) => {
    try {
        const tutorial = await tutorialService.createTutorial(req.body);
        res.status(201).json({
            status: 'success',
            data: tutorial
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Fetches all tutorials (Public)
 */
const getAllTutorials = async (req, res) => {
    try {
        const tutorials = await tutorialService.getAllTutorials();
        res.status(200).json({
            status: 'success',
            results: tutorials.length,
            data: tutorials
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles tutorial updates (Admin only)
 */
const updateTutorial = async (req, res) => {
    try {
        const tutorial = await tutorialService.updateTutorial(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: tutorial
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

/**
 * Handles tutorial deletion (Admin only)
 */
const deleteTutorial = async (req, res) => {
    try {
        await tutorialService.deleteTutorial(req.params.id);
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
    createTutorial,
    getAllTutorials,
    updateTutorial,
    deleteTutorial
};
