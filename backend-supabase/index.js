const express = require("express");

const categoriesRouter = require("./routes/categories");
const transactionsRouter = require("./routes/transactions");
const budgetsRouter = require("./routes/budgets");
const dashboardRouter = require("./routes/dashboard");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ service: "Financial Integrity API", version: "2.0.0", status: "ok", db: "supabase" });
});

app.use("/api/categories", categoriesRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
}

module.exports = app;
