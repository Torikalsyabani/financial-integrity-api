const notFound = (req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error", message: err.message });
};

module.exports = { notFound, errorHandler };
