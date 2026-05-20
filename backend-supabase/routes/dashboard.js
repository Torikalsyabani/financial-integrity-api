const { Router } = require("express");
const supabase = require("../lib/supabase");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const startDate = month + "-01";
    const endDate = month + "-31";

    const { data: txs } = await supabase.from("transactions").select("*").gte("date", startDate).lte("date", endDate);
    const { data: budgets } = await supabase.from("budgets").select("*");
    const { data: categories } = await supabase.from("categories").select("*");

    const totalIncome = (txs || []).filter(t => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = Math.abs((txs || []).filter(t => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0));

    // Top categories
    const catSpend = {};
    (txs || []).filter(t => t.amount < 0).forEach(t => {
      catSpend[t.category_id] = (catSpend[t.category_id] || 0) + Math.abs(Number(t.amount));
    });

    const topCategories = Object.entries(catSpend).map(([catId, spent]) => {
      const cat = (categories || []).find(c => c.id === catId);
      const budget = (budgets || []).find(b => b.category_id === catId);
      return { categoryId: catId, name: cat?.name || "Unknown", color: cat?.color || "#64748B", spent, limit: budget?.limit_amount || 0, percentUsed: budget ? Math.round((spent / budget.limit_amount) * 100) : 0 };
    }).sort((a, b) => b.spent - a.spent).slice(0, 5);

    // Alerts
    const alerts = (budgets || []).map(b => {
      const spent = Math.abs((txs || []).filter(t => t.category_id === b.category_id && t.amount < 0).reduce((s, t) => s + Number(t.amount), 0));
      const pct = Math.round((spent / b.limit_amount) * 100);
      const cat = (categories || []).find(c => c.id === b.category_id);
      if (pct >= 80) return { budgetId: b.id, category: cat?.name, percentUsed: pct, type: pct >= 100 ? "exceeded" : "warning" };
      return null;
    }).filter(Boolean);

    res.json({ month, totalIncome, totalExpense, netBalance: totalIncome - totalExpense, topCategories, alerts });
  } catch (e) { next(e); }
});

router.get("/category-breakdown", async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { data: txs } = await supabase.from("transactions").select("*").gte("date", month + "-01").lte("date", month + "-31").lt("amount", 0);
    const { data: categories } = await supabase.from("categories").select("*");

    const catSpend = {};
    (txs || []).forEach(t => { catSpend[t.category_id] = (catSpend[t.category_id] || 0) + Math.abs(Number(t.amount)); });
    const totalSpent = Object.values(catSpend).reduce((s, v) => s + v, 0);

    const breakdown = Object.entries(catSpend).map(([catId, spent]) => {
      const cat = (categories || []).find(c => c.id === catId);
      return { categoryId: catId, name: cat?.name || "Unknown", color: cat?.color || "#64748B", spent, percentage: totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0 };
    }).sort((a, b) => b.spent - a.spent);

    res.json({ month, totalSpent, breakdown });
  } catch (e) { next(e); }
});

router.get("/reports", async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const month = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const { data: txs } = await supabase.from("transactions").select("amount").gte("date", month + "-01").lte("date", month + "-31");
      const income = (txs || []).filter(t => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
      const expense = Math.abs((txs || []).filter(t => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0));
      result.push({ month, income, expense });
    }
    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
