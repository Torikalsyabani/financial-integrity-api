const express = require("express");
const cors    = require("cors");

const transactionsRouter = require("./routes/transactions");
const categoriesRouter   = require("./routes/categories");
const budgetsRouter      = require("./routes/budgets");
const dashboardRouter    = require("./routes/dashboard");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

/* ── CORS ─────────────────────────────────────────────────
   Allow all origins in dev. In production set ALLOWED_ORIGIN
   env var in your Vercel project settings.
──────────────────────────────────────────────────────────── */
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Health check ──────────────────────────────────────── */
app.get("/", (req, res) => {
  res.json({
    service: "Financial Integrity API",
    version: "1.0.0",
    status: "ok",
    endpoints: {
      dashboard: "/api/dashboard",
      transactions: "/api/transactions",
      categories: "/api/categories",
      budgets: "/api/budgets",
    },
  });
});

/* ── Routes ─────────────────────────────────────────────── */
app.use("/api/dashboard",    dashboardRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/categories",   categoriesRouter);
app.use("/api/budgets",      budgetsRouter);

/* ── Error handlers ─────────────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

/* ── Start server (skipped when imported by Vercel) ─────── */
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`✅  Financial Integrity API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
