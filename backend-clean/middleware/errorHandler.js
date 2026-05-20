/* middleware/errorHandler.js */

const errorHandler = (err, req, res, _next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${req.method}] ${req.path} →`, err);
  }

  res.status(status).json({ error: message });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

module.exports = { errorHandler, notFound };
