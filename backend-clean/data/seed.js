const categories = [
  { id: "cat-1", name: "Food & Dining", icon: "restaurant", color: "#F59E0B", type: "expense", status: "active", description: "Meals, groceries, cafes" },
  { id: "cat-2", name: "Transport",     icon: "directions_car", color: "#10B981", type: "expense", status: "active", description: "Fuel, public transport, ride-hailing" },
  { id: "cat-3", name: "Entertainment", icon: "sports_esports", color: "#EF4444", type: "expense", status: "active", description: "Streaming, events, hobbies" },
  { id: "cat-4", name: "Health",        icon: "favorite", color: "#6366F1", type: "expense", status: "active", description: "Medicine, gym, check-ups" },
  { id: "cat-5", name: "Shopping",      icon: "shopping_bag", color: "#EC4899", type: "expense", status: "active", description: "Clothes, electronics, etc." },
  { id: "cat-6", name: "Salary",        icon: "payments",  color: "#0EA5E9", type: "income",  status: "active", description: "Monthly salary" },
  { id: "cat-7", name: "Freelance",     icon: "work",      color: "#14B8A6", type: "income",  status: "active", description: "Freelance & side projects" },
];

const transactions = [
  { id: "txn-1",  date: "2023-09-24", description: "Whole Foods Market",    categoryId: "cat-1", method: "Credit Card", amount: -142500,  notes: "Weekly groceries" },
  { id: "txn-2",  date: "2023-09-23", description: "Gojek – Ojol",          categoryId: "cat-2", method: "E-Wallet",   amount: -35000,   notes: "" },
  { id: "txn-3",  date: "2023-09-22", description: "Netflix",               categoryId: "cat-3", method: "Credit Card", amount: -54000,   notes: "Monthly subscription" },
  { id: "txn-4",  date: "2023-09-21", description: "Apotek K-24",           categoryId: "cat-4", method: "Cash",       amount: -120000,  notes: "" },
  { id: "txn-5",  date: "2023-09-20", description: "Salary – September",    categoryId: "cat-6", method: "Bank Transfer", amount: 24500000, notes: "" },
  { id: "txn-6",  date: "2023-09-19", description: "Uniqlo",                categoryId: "cat-5", method: "Debit Card", amount: -450000,  notes: "" },
  { id: "txn-7",  date: "2023-09-18", description: "Freelance – Web Design",categoryId: "cat-7", method: "Bank Transfer", amount: 3500000,  notes: "Client project" },
  { id: "txn-8",  date: "2023-09-15", description: "KFC",                   categoryId: "cat-1", method: "E-Wallet",   amount: -87000,   notes: "" },
  { id: "txn-9",  date: "2023-09-12", description: "Pertamina – BBM",       categoryId: "cat-2", method: "Cash",       amount: -200000,  notes: "" },
  { id: "txn-10", date: "2023-09-10", description: "Bioskop CGV",           categoryId: "cat-3", method: "Debit Card", amount: -120000,  notes: "" },
];

const budgets = [
  { id: "bud-1", categoryId: "cat-1", limit: 5000000,  period: "monthly", spent: 4250000 },
  { id: "bud-2", categoryId: "cat-2", limit: 2000000,  period: "monthly", spent: 900000  },
  { id: "bud-3", categoryId: "cat-3", limit: 2000000,  period: "monthly", spent: 2200000 },
  { id: "bud-4", categoryId: "cat-4", limit: 1000000,  period: "monthly", spent: 120000  },
  { id: "bud-5", categoryId: "cat-5", limit: 3000000,  period: "monthly", spent: 450000  },
];

module.exports = { categories, transactions, budgets };
