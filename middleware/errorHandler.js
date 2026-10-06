function errorHandler(err, req, res, next) {
    console.error(err.message || err);

    // Mongoose Validation Error (e.g. required field missing)
    if (err.name === "ValidationError") {
        const errors = {};
        for (let field in err.errors) {
            errors[field] = err.errors[field].message;
        }

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
        });
    }

    // Invalid MongoDB ObjectId (CastError)
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`
        });
    }

    // Generic fallback error
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
}

module.exports = errorHandler;