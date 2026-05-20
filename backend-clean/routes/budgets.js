const { Router } = require("express");
const { store, uid, findById, removeById, updateById } = require("../lib/store");

const router = Router();

/* GET /api/budgets */
router.get("/", (req, res) => {
  const enriched = store.budgets.map((b) => {
    const category = store.categories.find((c) => c.id === b.categoryId) || null;
    const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
    return { ...b, category, percentUsed: pct, status: pct >= 100 ? "exceeded" : pct >= 80 ? "warning" : "ok" };
  });
  res.json(enriched);
});

/* GET /api/budgets/summary */
router.get("/summary", (req, res) => {
  const totalLimit = store.budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = store.budgets.reduce((s, b) => s + b.spent, 0);
  const exceeded   = store.budgets.filter((b) => b.spent > b.limit).length;
  const warning    = store.budgets.filter((b) => b.spent / b.limit >= 0.8 && b.spent <= b.limit).length;
  res.json({ totalLimit, totalSpent, totalRemaining: totalLimit - totalSpent, exceeded, warning, budgetCount: store.budgets.length });
});

/* GET /api/budgets/:id */
router.get("/:id", (req, res) => {
  const item = findById("budgets", req.params.id);
  if (!item) return res.status(404).json({ error: "Budget not found" });
  res.json(item);
});

/* POST /api/budgets */
router.post("/", (req, res) => {
  const { categoryId, limit, period } = req.body;

  if (!categoryId || !limit) {
    return res.status(400).json({ error: "categoryId and limit are required" });
  }

  const catExists = findById("categories", categoryId);
  if (!catExists) return res.status(404).json({ error: "Category not found" });

  const existing = store.budgets.find((b) => b.categoryId === categoryId);
  if (existing) return res.status(409).json({ error: "Budget already exists for this category. Use PUT to update." });

  const newBudget = {
    id: uid("bud"),
    categoryId,
    limit: Number(limit),
    period: period || "monthly",
    spent: 0,
    createdAt: new Date().toISOString(),
  };

  store.budgets.push(newBudget);
  res.status(201).json(newBudget);
});

/* PUT /api/budgets/:id */
router.put("/:id", (req, res) => {
  const item = findById("budgets", req.params.id);
  if (!item) return res.status(404).json({ error: "Budget not found" });

  const { limit, period, spent } = req.body;
  const patch = {};
  if (limit  !== undefined) patch.limit  = Number(limit);
  if (period !== undefined) patch.period = period;
  if (spent  !== undefined) patch.spent  = Number(spent);

  const updated = updateById("budgets", req.params.id, patch);
  res.json(updated);
});

/* DELETE /api/budgets/:id */
router.delete("/:id", (req, res) => {
  const removed = removeById("budgets", req.params.id);
  if (!removed) return res.status(404).json({ error: "Budget not found" });
  res.json({ message: "Budget deleted" });
});

module.exports = router;
