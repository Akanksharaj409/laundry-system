# 🧺 LaundrySoft — Mini Laundry Order Management System

A clean, production-ready laundry order management system built with **Node.js + Express** backend and **pure Vanilla HTML/CSS/JS** frontend with Tailwind CSS.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
node server.js
```

### 3. Open in browser
```
http://localhost:3000
```

That's it! No build step, no bundler, no database needed.

---

## 📁 Project Structure

```
laundry-app/
├── server.js       ← Node.js + Express backend (REST API + static file serving)
├── index.html      ← Full SPA frontend (HTML + CSS + JS, all in one file)
├── package.json    ← Dependencies
└── README.md       ← You are here
```

---

## ✨ Features

### 🖊️ Create Order
- Enter customer name & phone
- Dynamically add/remove garment rows (Shirt, Pants, Saree, Dress, Kurta, Blouse)
- Real-time total bill calculation
- Auto-generated UUID order ID
- Estimated delivery = today + 3 days
- Auto-switches to View Orders tab after success

### 📋 View Orders
- Full orders table with all details
- Filter by: Status, Customer Name, Phone
- Color-coded status badges
- Inline status update dropdown (updates instantly via API)

### 📊 Dashboard
- Total orders & revenue cards
- Orders by status breakdown
- Top garments processed (bar chart)

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create a new order |
| `GET` | `/api/orders` | Get all orders (supports `?status=`, `?customer_name=`, `?phone=`) |
| `PATCH` | `/api/orders/:id/status` | Update order status |
| `GET` | `/api/dashboard` | Get aggregate stats |

### Example: Create an order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Priya Sharma",
    "phone": "9876543210",
    "garments": [
      { "type": "Shirt", "quantity": 2 },
      { "type": "Saree", "quantity": 1 }
    ]
  }'
```

---

## 💰 Garment Prices

| Garment | Price |
|---------|-------|
| Shirt   | ₹50   |
| Pants   | ₹60   |
| Saree   | ₹100  |
| Dress   | ₹80   |
| Kurta   | ₹70   |
| Blouse  | ₹40   |

---

## ⚙️ Configuration

The server runs on port **3000** by default. Override with:
```bash
PORT=8080 node server.js
```

---

## 📝 Notes

- All data is stored **in-memory** — it will be lost when the server restarts. This is by design for simplicity.
- No database, no authentication, no build tools required.
- To run with auto-restart on file changes: `npm run dev` (requires `nodemon`)
