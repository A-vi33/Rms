const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const dayjs = require('dayjs');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Menu state
let activeMenu = [];

// Async load of ESM menu
(async () => {
  try {
    const menuModule = await import('./pos/src/assets/data/menu.js');
    const menu = menuModule.MENU || [];
    activeMenu = menu.map(m => ({ ...m, available: true }));
    console.log(`Menu loaded: ${activeMenu.length} items`);
  } catch (err) {
    console.error('Failed to load menu:', err);
  }
})();

app.get('/api/menu', (_, res) => {
  res.json({ menu: activeMenu });
});

app.post('/api/menu', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items array required' });
  }
  // Merge availability
  activeMenu = items.map(item => ({
     ...item,
     available: activeMenu.find(m => m.id === item.id)?.available ?? true
  }));
  io.emit('menu:update', activeMenu);
  res.json({ ok: true, count: activeMenu.length });
});

app.patch('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const idx = activeMenu.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'item not found' });
  
  // Update fields
  activeMenu[idx] = { ...activeMenu[idx], ...req.body };
  
  io.emit('menu:update', activeMenu);
  res.json(activeMenu[idx]);
});

app.get('/api/settings', (_, res) => res.json(settings));

app.patch('/api/settings', (req, res) => {
  Object.assign(settings, req.body || {});
  res.json(settings);
});

app.post('/api/orders', (req, res) => {
  const { items, discount = 0, notes = '', customer = {}, type = 'dine-in', status = 'received', table = '' } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items required' });
  }

  const detailedItems = items.map(row => {
    const m = activeMenu.find(x => x.id === row.id);
    if (!m) throw new Error(`menu item ${row.id} not found`);
    if (!m.available) throw new Error(`menu item ${m.name} is currently unavailable`);
    const qty = Math.max(1, Number(row.qty || 1));
    const rate = m.price;
    const amount = rate * qty;
    return { 
      id: m.id, 
      name: m.name, 
      qty, 
      rate, 
      amount,
      destination: m.destination || 'kitchen' 
    };
  });

  const subTotal = detailedItems.reduce((s, r) => s + r.amount, 0);
  const productDiscount = Math.max(0, Number(discount || 0));
  const discountedSubtotal = Math.max(0, subTotal - productDiscount);

  const serviceCharge = round2(discountedSubtotal * settings.serviceChargeRate);
  const taxable = discountedSubtotal + serviceCharge;

  let cgst = 0, sgst = 0, igst = 0;
  if (settings.intraState) {
    cgst = round2(taxable * (settings.gstRate / 2));
    sgst = round2(taxable * (settings.gstRate / 2));
  } else {
    igst = round2(taxable * settings.gstRate);
  }

  let total = taxable + cgst + sgst + igst;
  let roundOff = 0;
  if (settings.roundOff) {
    const rounded = Math.round(total);
    roundOff = round2(rounded - total);
    total = rounded;
  }

  const newOrder = {
    id: String(Date.now()).slice(-6),
    items: detailedItems,
    subTotal, discount: productDiscount,
    serviceCharge, taxable, cgst, sgst, igst, total, roundOff,
    status, // 'draft', 'kot', 'billed', 'paid'
    type,   // 'dine-in', 'takeaway'
    table,  // Added table number
    notes,
    createdAt: new Date(),
    customer
  };
  orders.push(newOrder);
  io.emit('orders:update', orders); // Notify kitchen/billing
  res.json(newOrder);
});

// Orders state
let orders = [];

app.get('/api/orders', (req, res) => {
  const { status, type } = req.query;
  let filtered = orders;
  if (status) filtered = filtered.filter(o => o.status === status);
  if (type) filtered = filtered.filter(o => o.type === type);
  res.json({ orders: filtered });
});

app.post('/api/orders/:id/pay', (req, res) => {
  const { id } = req.params;
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'order not found' });
  
  orders[idx].status = 'paid';
  io.emit('orders:update', orders);
  res.json(orders[idx]);
});

app.post('/api/orders/:id/deliver', (req, res) => {
  const { id } = req.params;
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'order not found' });
  
  // 'delivered' means kitchen has completed it, but it might not be paid yet
  // We can keep status as 'delivered' to clear it from KDS
  orders[idx].status = 'delivered'; 
  io.emit('orders:update', orders);
  res.json(orders[idx]);
});

// Settings (moved down)
const settings = {
  gstRate: 0.05,
  intraState: true,
  serviceChargeRate: 0.0,
  roundOff: true,
  currency: 'INR'
};

io.on('connection', socket => {
    socket.emit('menu:update', activeMenu);
    socket.emit('orders:update', orders);
  });

const PORT = process.env.PORT || 5174;
server.listen(PORT, () => {
  console.log(`RMS server running on http://localhost:${PORT}`);
});

function normalizeMenuItem(itm) {
  return {
    id: String(itm.id || 'itm_' + Math.random().toString(36).slice(2, 7)),
    name: String(itm.name || 'Item'),
    price: Number(itm.price || 0),
    category: String(itm.category || 'General'),
    available: itm.available !== false
  };
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

