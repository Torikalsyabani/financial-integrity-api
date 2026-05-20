const { Router } = require("express");
const supabase = require("../lib/supabase");

const router = Router();
const uid = () => "tx_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const from = (page - 1) * limit;

    let query = supabase.from("transactions").select("*", { count: "exact" }).order("date", { ascending: false }).order("created_at", { ascending: false }).range(from, from + limit - 1);
    if (req.query.type) query = query.eq("type", req.query.type);
    if (req.query.categoryId) query = query.eq("category_id", req.query.categoryId);

    const { data, error, count } = await query;
    if (error) throw error;
    // rename category_id to categoryId
    const mapped = (data || []).map(t => ({ ...t, categoryId: t.category_id }));
    res.json({ data: mapped, total: count, page, limit });
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { date, description, categoryId, method, amount, type, notes } = req.body;
    if (!date || !description || !amount) return res.status(400).json({ error: "date, description, amount required" });
    const newTx = { id: uid(), date, description, category_id: categoryId, method: method || "Cash", amount: Number(amount), type, notes: notes || "" };
    const { data, error } = await supabase.from("transactions").insert(newTx).select().single();
    if (error) throw error;
    res.status(201).json({ ...data, categoryId: data.category_id });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { error } = await supabase.from("transactions").delete().eq("id", req.params.id);
    if (error) return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (e) { next(e); }
});

module.exports = router;
