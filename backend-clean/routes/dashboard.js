const { Router } = require("express");
const { store } = require("../lib/store");

const router = Router();

/* ── helpers ─────────────────────────────── */
const sum = (arr) => arr.reduce((s, n) => s + n, 0);

/* GET /api/dashboard
   Returns high-level KPIs + top spending categories for the current month */
router.get("/", (req, res) => {
  const now   = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthTxns = store.transactions.filter((t) => t.date.startsWith(month));

  const totalIncome  = sum(monthTxns.filter((t) => t.amount > 0).map((t) => t.amount));
  const totalExpense = Math.abs(sum(monthTxns.filter((t) => t.amount < 0).map((t) => t.amount)));
  const netBalance   = totalIncome - totalExpense;

  // Spending per category
  const spendMap = {};
  monthTxns.filter((t) => t.amount < 0).forEach((t) => {
    spendMap[t.categoryId] = (spendMap[t.categoryId] || 0) + Math.abs(t.amount);
  });

  const topCategories = Object.entries(spendMap)
    .map(([catId, spent]) => {
      const cat    = store.categories.find((c) => c.id === catId);
      const budget = store.budgets.find((b) => b.categoryId === catId);
      return {
        categoryId: catId,
        name:   cat?.name || catId,
        icon:   cat?.icon || "label",
        color:  cat?.color || "#64748B",
        spent,
        limit:  budget?.limit || null,
        percentUsed: budget?.limit ? Math.round((spent / budget.limit) * 100) : null,
      };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  // Budget alerts
  const alerts = store.budgets
    .filter((b) => b.spent / b.limit >= 0.8)
    .map((b) => {
      const cat = store.categories.find((c) => c.id === b.categoryId);
      return {
        budgetId: b.id,
        category: cat?.name || b.categoryId,
        spent: b.spent,
        limit: b.limit,
        percentUsed: Math.round((b.spent / b.limit) * 100),
        type: b.spent > b.limit ? "exceeded" : "warning",
      };
    });

  res.json({ month, totalIncome, totalExpense, netBalance, topCategories, alerts });
});

/* GET /api/dashboard/reports
   Monthly totals for the last N months (for bar/line charts) */
router.get("/reports", (req, res) => {
  const months = Number(req.query.months) || 6;
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const txns   = store.transactions.filter((t) => t.date.startsWith(key));
    const income = sum(txns.filter((t) => t.amount > 0).map((t) => t.amount));
    const expense = Math.abs(sum(txns.filter((t) => t.amount < 0).map((t) => t.amount)));

    result.push({ month: key, income, expense, net: income - expense });
  }

  res.json(result);
});

/* GET /api/dashboard/category-breakdown
   Expense breakdown by category for a given month (for donut chart) */
router.get("/category-breakdown", (req, res) => {
  const now   = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const txns = store.transactions.filter((t) => t.date.startsWith(month) && t.amount < 0);

  const map = {};
  txns.forEach((t) => {
    map[t.categoryId] = (map[t.categoryId] || 0) + Math.abs(t.amount);
  });

  const totalSpent = sum(Object.values(map));

  const breakdown = Object.entries(map).map(([catId, spent]) => {
    const cat = store.categories.find((c) => c.id === catId);
    return {
      categoryId: catId,
      name: cat?.name || catId,
      icon: cat?.icon || "label",
      color: cat?.color || "#64748B",
      spent,
      percentage: totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0,
    };
  }).sort((a, b) => b.spent - a.spent);

  res.json({ month, totalSpent, breakdown });
});

module.exports = router;
