const { Router } = require("express");
const supabase = require("../lib/supabase");

const router = Router();
const uid = () => "bud_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

const currentMonth = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; };

async function enrichBudget(b) {
  const { data: cat } = await supabase.from("categories").select("*").eq("id", b.category_id).single();
  const month = currentMonth();
  const { data: txs } = await supabase.from("transactions").select("amount").eq("category_id", b.category_id).eq("type", "expense").gte("date", month + "-01").lt("date", month + "-32");
  const spent = Math.abs((txs || []).reduce((s, t) => s + Number(t.amount), 0));
  const pct = b.limit_amount > 0 ? Math.round((spent / b.limit_amount) * 100) : 0;
  const status = pct >= 100 ? "exceeded" : pct >= 80 ? "warning" : "ok";
  return { id: b.id, categoryId: b.category_id, category: cat, limit: b.limit_amount, period: b.period, spent, percentUsed: pct, status };
}

router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("budgets").select("*");
    if (error) throw error;
    const enriched = await Promise.all((data || []).map(enrichBudget));
    res.json(enriched);
  } catch (e) { next(e); }
});

router.get("/summary", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("budgets").select("*");
    if (error) throw error;
    const enriched = await Promise.all((data || []).map(enrichBudget));
    const totalLimit = enriched.reduce((s, b) => s + b.limit, 0);
    const totalSpent = enriched.reduce((s, b) => s + b.spent, 0);
    res.json({ totalLimit, totalSpent, totalRemaining: totalLimit - totalSpent });
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { categoryId, limit, period } = req.body;
    if (!categoryId || !limit) return res.status(400).json({ error: "categoryId and limit required" });
    const newBud = { id: uid(), category_id: categoryId, limit_amount: Number(limit), period: period || "monthly" };
    const { data, error } = await supabase.from("budgets").insert(newBud).select().single();
    if (error) throw error;
    res.status(201).json(await enrichBudget(data));
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { limit, period } = req.body;
    const { data, error } = await supabase.from("budgets").update({ limit_amount: Number(limit), period }).eq("id", req.params.id).select().single();
    if (error) return res.status(404).json({ error: "Budget not found" });
    res.json(await enrichBudget(data));
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { error } = await supabase.from("budgets").delete().eq("id", req.params.id);
    if (error) return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Budget deleted" });
  } catch (e) { next(e); }
});

module.exports = router;
