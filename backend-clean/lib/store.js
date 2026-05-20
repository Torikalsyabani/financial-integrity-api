/**
 * lib/store.js
 * Simple in-memory store seeded with demo data.
 * NOTE: Vercel serverless functions are stateless — data resets on cold starts.
 * For persistence, swap this store with Vercel KV / PlanetScale / Supabase.
 */

const { categories, transactions, budgets } = require("../data/seed");

// Deep-clone seed so tests don't mutate originals
const store = {
  categories:   JSON.parse(JSON.stringify(categories)),
  transactions: JSON.parse(JSON.stringify(transactions)),
  budgets:      JSON.parse(JSON.stringify(budgets)),
};

/* ── helpers ─────────────────────────────────────────────── */

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const findById = (collection, id) => store[collection].find((x) => x.id === id);

const removeById = (collection, id) => {
  const idx = store[collection].findIndex((x) => x.id === id);
  if (idx === -1) return false;
  store[collection].splice(idx, 1);
  return true;
};

const updateById = (collection, id, patch) => {
  const item = findById(collection, id);
  if (!item) return null;
  Object.assign(item, patch, { id }); // id is immutable
  return item;
};

module.exports = { store, uid, findById, removeById, updateById };
