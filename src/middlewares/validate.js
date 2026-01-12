const validate = (schema) => (req, res, next) => {
    try {
        console.log('Incoming Body:', req.body);
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        console.error('Validation Error:', error.errors);
        return res.status(400).json({
            status: 'fail',
            errors: error.errors.map(err => ({
                path: err.path[1],
                message: err.message
            }))
        });
    }
};

module.exports = validate;
