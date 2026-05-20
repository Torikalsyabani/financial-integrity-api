const { Router } = require("express");
const supabase = require("../lib/supabase");

const router = Router();

const uid = () => "cat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

router.get("/", async (req, res, next) => {
  try {
    let query = supabase.from("categories").select("*").order("created_at", { ascending: true });
    if (req.query.type) query = query.eq("type", req.query.type);
    if (req.query.status) query = query.eq("status", req.query.status);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("categories").select("*").eq("id", req.params.id).single();
    if (error) return res.status(404).json({ error: "Category not found" });
    res.json(data);
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, icon, color, type, description } = req.body;
    if (!name || !type) return res.status(400).json({ error: "name and type are required" });

    const { data: existing } = await supabase.from("categories").select("id").ilike("name", name).single();
    if (existing) return res.status(409).json({ error: "Category name already exists" });

    const newCat = { id: uid(), name: name.trim(), icon: icon || "label", color: color || "#64748B", type, status: "active", description: description || "" };
    const { data, error } = await supabase.from("categories").insert(newCat).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("categories").update(req.body).eq("id", req.params.id).select().single();
    if (error) return res.status(404).json({ error: "Category not found" });
    res.json(data);
  } catch (e) { next(e); }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const { data, error } = await supabase.from("categories").update({ status }).eq("id", req.params.id).select().single();
    if (error) return res.status(404).json({ error: "Category not found" });
    res.json(data);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { data: inUse } = await supabase.from("transactions").select("id").eq("category_id", req.params.id).limit(1);
    if (inUse && inUse.length > 0) return res.status(409).json({ error: "Cannot delete: category is used by existing transactions" });
    const { error } = await supabase.from("categories").delete().eq("id", req.params.id);
    if (error) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (e) { next(e); }
});

module.exports = router;
