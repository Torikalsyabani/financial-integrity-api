const { Router } = require("express");
const { store, uid, findById, removeById, updateById } = require("../lib/store");

const router = Router();

/* GET /api/categories */
router.get("/", (req, res) => {
  const { type, status } = req.query;
  let results = [...store.categories];
  if (type)   results = results.filter((c) => c.type === type);
  if (status) results = results.filter((c) => c.status === status);
  res.json(results);
});

/* GET /api/categories/:id */
router.get("/:id", (req, res) => {
  const item = findById("categories", req.params.id);
  if (!item) return res.status(404).json({ error: "Category not found" });
  res.json(item);
});

/* POST /api/categories */
router.post("/", (req, res) => {
  const { name, icon, color, type, description } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "name and type (income|expense) are required" });
  }

  const duplicate = store.categories.find(
    (c) => c.name.toLowerCase() === String(name).toLowerCase()
  );
  if (duplicate) return res.status(409).json({ error: "Category name already exists" });

  const newCat = {
    id: uid("cat"),
    name: String(name).trim(),
    icon: icon || "label",
    color: color || "#64748B",
    type,
    status: "active",
    description: description || "",
    createdAt: new Date().toISOString(),
  };

  store.categories.push(newCat);
  res.status(201).json(newCat);
});

/* PUT /api/categories/:id */
router.put("/:id", (req, res) => {
  const item = findById("categories", req.params.id);
  if (!item) return res.status(404).json({ error: "Category not found" });

  const updated = updateById("categories", req.params.id, req.body);
  res.json(updated);
});

/* PATCH /api/categories/:id/status */
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ error: "status must be 'active' or 'inactive'" });
  }
  const updated = updateById("categories", req.params.id, { status });
  if (!updated) return res.status(404).json({ error: "Category not found" });
  res.json(updated);
});

/* DELETE /api/categories/:id */
router.delete("/:id", (req, res) => {
  // Check if category is used
  const inUse = store.transactions.some((t) => t.categoryId === req.params.id);
  if (inUse) {
    return res.status(409).json({ error: "Cannot delete: category is used by existing transactions" });
  }
  const removed = removeById("categories", req.params.id);
  if (!removed) return res.status(404).json({ error: "Category not found" });
  res.json({ message: "Category deleted" });
});

module.exports = router;
