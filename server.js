/**
 * Mini Laundry Order Management System
 * Backend: Node.js + Express.js
 * Storage: In-memory (array)
 */

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve index.html from same folder

// ─── In-Memory Storage ─────────────────────────────────────────────────────────
let orders = [];

// ─── Hardcoded Prices ──────────────────────────────────────────────────────────
const PRICES = {
  Shirt: 50,
  Pants: 60,
  Saree: 100,
  Dress: 80,
  Kurta: 70,
  Blouse: 40,
};

// ─── Valid Statuses ────────────────────────────────────────────────────────────
const VALID_STATUSES = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

// ─── Helper: Calculate bill ────────────────────────────────────────────────────
function calculateTotal(garments) {
  return garments.reduce((sum, g) => {
    const price = PRICES[g.type] || 0;
    return sum + price * (parseInt(g.quantity) || 0);
  }, 0);
}

// ─── Helper: Add days to date ──────────────────────────────────────────────────
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0]; // YYYY-MM-DD
}

// ─────────────────────────────────────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/orders
 * Create a new laundry order.
 * Body: { customerName, phone, garments: [{ type, quantity }] }
 */
app.post("/api/orders", (req, res) => {
  const { customerName, phone, garments } = req.body;

  // Basic validation
  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: "Customer name is required." });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Phone number is required." });
  }
  if (!garments || !Array.isArray(garments) || garments.length === 0) {
    return res.status(400).json({ error: "At least one garment is required." });
  }

  // Validate each garment
  for (const g of garments) {
    if (!PRICES[g.type]) {
      return res.status(400).json({ error: `Unknown garment type: ${g.type}` });
    }
    if (!g.quantity || parseInt(g.quantity) < 1) {
      return res.status(400).json({ error: "Each garment must have quantity >= 1." });
    }
  }

  const totalBill = calculateTotal(garments);
  const today = new Date().toISOString().split("T")[0];

  const newOrder = {
    id: uuidv4(),
    customerName: customerName.trim(),
    phone: phone.trim(),
    garments: garments.map((g) => ({
      type: g.type,
      quantity: parseInt(g.quantity),
      unitPrice: PRICES[g.type],
    })),
    totalBill,
    status: "RECEIVED",
    createdAt: today,
    estimatedDelivery: addDays(today, 3),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

/**
 * GET /api/orders
 * Retrieve all orders. Supports query filters:
 *   ?status=RECEIVED&customer_name=John&phone=9999
 */
app.get("/api/orders", (req, res) => {
  let result = [...orders];

  const { status, customer_name, phone } = req.query;

  if (status) {
    result = result.filter((o) => o.status === status.toUpperCase());
  }
  if (customer_name) {
    const q = customer_name.toLowerCase();
    result = result.filter((o) => o.customerName.toLowerCase().includes(q));
  }
  if (phone) {
    result = result.filter((o) => o.phone.includes(phone));
  }

  // Return newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(result);
});

/**
 * PATCH /api/orders/:id/status
 * Update the status of an order.
 * Body: { status: "PROCESSING" }
 */
app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  order.status = status;
  res.json(order);
});

/**
 * GET /api/dashboard
 * Return aggregate statistics.
 */
app.get("/api/dashboard", (req, res) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalBill, 0);

  const byStatus = {
    RECEIVED: 0,
    PROCESSING: 0,
    READY: 0,
    DELIVERED: 0,
  };
  orders.forEach((o) => {
    if (byStatus[o.status] !== undefined) byStatus[o.status]++;
  });

  // Top garments
  const garmentCounts = {};
  orders.forEach((o) => {
    o.garments.forEach((g) => {
      garmentCounts[g.type] = (garmentCounts[g.type] || 0) + g.quantity;
    });
  });

  res.json({ totalOrders, totalRevenue, byStatus, garmentCounts });
});

// ─── Catch-all: serve index.html ───────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🧺 Laundry Order Management System running!`);
  console.log(`   → Local:  http://localhost:${PORT}\n`);
});
