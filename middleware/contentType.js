function contentType(req, res, next) {
    if (req.method === "POST" || req.method === "PUT") {
        const contentType = req.get("Content-Type");

        if (!contentType || !contentType.startsWith("application/json")) {
            return res.status(400).json({
                message: "Content-Type must be application/json"
            });
        }
    }

    next();
}

module.exports = contentType;