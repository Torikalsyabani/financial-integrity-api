const { Router } = require("express");
const { store, uid, findById, removeById, updateById } = require("../lib/store");

const router = Router();

/* GET /api/transactions
   Query params: categoryId, type (income|expense), startDate, endDate, page, limit */
router.get("/", (req, res) => {
  const { categoryId, type, startDate, endDate, page = 1, limit = 20 } = req.query;

  let results = [...store.transactions];

  if (categoryId) results = results.filter((t) => t.categoryId === categoryId);
  if (type === "income")  results = results.filter((t) => t.amount > 0);
  if (type === "expense") results = results.filter((t) => t.amount < 0);
  if (startDate) results = results.filter((t) => t.date >= startDate);
  if (endDate)   results = results.filter((t) => t.date <= endDate);

  // Sort newest first
  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = results.length;
  const start = (Number(page) - 1) * Number(limit);
  const data  = results.slice(start, start + Number(limit));

  res.json({ data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) });
});

/* GET /api/transactions/:id */
router.get("/:id", (req, res) => {
  const item = findById("transactions", req.params.id);
  if (!item) return res.status(404).json({ error: "Transaction not found" });
  res.json(item);
});

/* POST /api/transactions */
router.post("/", (req, res) => {
  const { date, description, categoryId, method, amount, notes } = req.body;

  if (!date || !description || !categoryId || amount === undefined) {
    return res.status(400).json({ error: "date, description, categoryId and amount are required" });
  }

  const newTxn = {
    id: uid("txn"),
    date,
    description: String(description).trim(),
    categoryId,
    method: method || "Cash",
    amount: Number(amount),
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };

  store.transactions.push(newTxn);

  // Auto-update budget spent
  const budget = store.budgets.find((b) => b.categoryId === categoryId);
  if (budget && amount < 0) budget.spent = (budget.spent || 0) + Math.abs(amount);

  res.status(201).json(newTxn);
});

/* PUT /api/transactions/:id */
router.put("/:id", (req, res) => {
  const item = findById("transactions", req.params.id);
  if (!item) return res.status(404).json({ error: "Transaction not found" });

  const updated = updateById("transactions", req.params.id, req.body);
  res.json(updated);
});

/* DELETE /api/transactions/:id */
router.delete("/:id", (req, res) => {
  const removed = removeById("transactions", req.params.id);
  if (!removed) return res.status(404).json({ error: "Transaction not found" });
  res.json({ message: "Transaction deleted" });
});

module.exports = router;
