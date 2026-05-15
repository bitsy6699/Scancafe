const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Helper: deduct stock for an order (called when status becomes 'paid')
function deductStockForOrder(orderId) {
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  for (const item of items) {
    const recipes = db.prepare(`
      SELECT r.ingredient_id, r.quantity_needed, i.stock, i.min_stock, i.name
      FROM recipes r JOIN ingredients i ON r.ingredient_id = i.id
      WHERE r.menu_id = ?
    `).all(item.menu_id);

    for (const recipe of recipes) {
      const totalNeeded = recipe.quantity_needed * item.quantity;
      const newStock = Math.max(0, recipe.stock - totalNeeded);
      db.prepare('UPDATE ingredients SET stock = ? WHERE id = ?').run(newStock, recipe.ingredient_id);
    }
  }
}

// Helper: check if all items in cart can be fulfilled
function checkStockAvailability(cartItems) {
  const shortages = [];
  for (const cartItem of cartItems) {
    const recipes = db.prepare(`
      SELECT r.quantity_needed, i.name as ingredient_name, i.stock, i.unit
      FROM recipes r JOIN ingredients i ON r.ingredient_id = i.id
      WHERE r.menu_id = ?
    `).all(cartItem.menu_id);

    for (const recipe of recipes) {
      const needed = recipe.quantity_needed * cartItem.quantity;
      if (recipe.stock < needed) {
        shortages.push({
          ingredient: recipe.ingredient_name,
          needed,
          available: recipe.stock,
          unit: recipe.unit
        });
      }
    }
  }
  return shortages;
}

// Helper: auto-mark menus unavailable based on stock
function updateMenuAvailability() {
  const menus = db.prepare('SELECT id FROM menus').all();
  for (const menu of menus) {
    const recipes = db.prepare(`
      SELECT r.quantity_needed, i.stock
      FROM recipes r JOIN ingredients i ON r.ingredient_id = i.id
      WHERE r.menu_id = ?
    `).all(menu.id);

    if (recipes.length > 0) {
      const canMakeAtLeastOne = recipes.every(r => r.stock >= r.quantity_needed);
      db.prepare('UPDATE menus SET is_available = ? WHERE id = ?').run(canMakeAtLeastOne ? 1 : 0, menu.id);
    }
  }
}

// GET /api/orders - Protected: list orders with optional filter
router.get('/', authenticateToken, (req, res) => {
  const { status, date_from, date_to, limit = 50, offset = 0 } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status && status !== 'all') { query += ' AND status = ?'; params.push(status); }
  if (date_from) { query += ' AND DATE(created_at) >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND DATE(created_at) <= ?'; params.push(date_to); }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const orders = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM orders WHERE 1=1' +
    (status && status !== 'all' ? ' AND status = ?' : '')).get(...(status && status !== 'all' ? [status] : []));

  // Attach items to each order
  const ordersWithItems = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  res.json({ success: true, data: ordersWithItems, total: total.count });
});

// GET /api/orders/active - Protected: active orders (not completed/cancelled)
router.get('/active', authenticateToken, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders
    WHERE status NOT IN ('completed', 'cancelled')
    ORDER BY created_at DESC
  `).all();

  const ordersWithItems = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
  }));

  res.json({ success: true, data: ordersWithItems });
});

// GET /api/orders/:id - Public: single order detail
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
  res.json({ success: true, data: { ...order, items } });
});

// POST /api/orders - Public: create new order
router.post('/', (req, res) => {
  const { table_number, items, payment_method, customer_name, notes } = req.body;

  if (!table_number || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Nomor meja dan item pesanan wajib diisi' });
  }

  if (!['cash', 'online'].includes(payment_method)) {
    return res.status(400).json({ success: false, message: 'Metode pembayaran tidak valid' });
  }

  // Check menu availability
  for (const item of items) {
    const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(item.menu_id);
    if (!menu) return res.status(400).json({ success: false, message: `Menu ID ${item.menu_id} tidak ditemukan` });
    if (!menu.is_available) return res.status(400).json({ success: false, message: `${menu.name} sudah habis` });
  }

  // Check stock
  const shortages = checkStockAvailability(items);
  if (shortages.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Stok tidak mencukupi',
      shortages
    });
  }

  // Calculate total
  let total_amount = 0;
  const enrichedItems = [];
  for (const item of items) {
    const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(item.menu_id);
    const subtotal = menu.price * item.quantity;
    total_amount += subtotal;
    enrichedItems.push({ menu, quantity: item.quantity, subtotal });
  }

  // Create order in transaction
  const createOrder = db.transaction(() => {
    const status = payment_method === 'online' ? 'waiting_payment' : 'waiting_payment';

    const orderResult = db.prepare(`
      INSERT INTO orders (table_number, status, payment_method, total_amount, customer_name, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(table_number, status, payment_method, total_amount, customer_name || '', notes || '');

    const orderId = orderResult.lastInsertRowid;

    for (const { menu, quantity, subtotal } of enrichedItems) {
      db.prepare(`
        INSERT INTO order_items (order_id, menu_id, menu_name, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(orderId, menu.id, menu.name, quantity, menu.price, subtotal);
    }

    return orderId;
  });

  const orderId = createOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  res.status(201).json({ success: true, data: { ...order, items: orderItems } });
});

// PATCH /api/orders/:id/status - Protected: update order status
router.patch('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['waiting_payment', 'paid', 'in_progress', 'ready', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

  const updateOrder = db.transaction(() => {
    let extraUpdate = '';
    const params = [status];

    if (status === 'paid') {
      extraUpdate = ', paid_at = CURRENT_TIMESTAMP';
      // Deduct stock
      deductStockForOrder(order.id);
      // Update menu availability
      updateMenuAvailability();
    }
    if (status === 'completed') {
      extraUpdate += ', completed_at = CURRENT_TIMESTAMP';
    }

    db.prepare(`UPDATE orders SET status = ?${extraUpdate} WHERE id = ?`).run(...params, req.params.id);
  });

  updateOrder();

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);

  res.json({ success: true, data: { ...updated, items } });
});

// PATCH /api/orders/:id/confirm-payment - Protected: confirm cash payment
router.patch('/:id/confirm-payment', authenticateToken, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  if (order.status !== 'waiting_payment') {
    return res.status(400).json({ success: false, message: 'Pesanan tidak dalam status menunggu pembayaran' });
  }

  const confirmPayment = db.transaction(() => {
    db.prepare(`UPDATE orders SET status='paid', paid_at=CURRENT_TIMESTAMP WHERE id=?`).run(req.params.id);
    deductStockForOrder(order.id);
    updateMenuAvailability();
  });

  confirmPayment();

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);

  res.json({ success: true, data: { ...updated, items } });
});

// PATCH /api/orders/:id/simulate-payment - Public: simulate online payment
router.patch('/:id/simulate-payment', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  if (order.payment_method !== 'online') {
    return res.status(400).json({ success: false, message: 'Bukan pesanan online' });
  }

  const simulatePay = db.transaction(() => {
    db.prepare(`UPDATE orders SET status='paid', paid_at=CURRENT_TIMESTAMP WHERE id=?`).run(req.params.id);
    deductStockForOrder(order.id);
    updateMenuAvailability();
  });

  simulatePay();

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: updated });
});

module.exports = router;
