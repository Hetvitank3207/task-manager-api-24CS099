
function validateTask(req, res, next) {
  const { title } = req.body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      message: "Validation failed: title is required."
    });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      message: "Title cannot exceed 200 characters."
    });
  }

  req.body.title = title.trim();
  next();
}

module.exports = validateTask;
