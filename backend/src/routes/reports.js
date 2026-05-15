const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/reports/summary - Protected: dashboard summary
router.get('/summary', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const todaySales = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as count
    FROM orders WHERE DATE(created_at) = ? AND status NOT IN ('cancelled', 'waiting_payment')
  `).get(today);

  const totalOrders = db.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('cancelled')
  `).get();

  const pendingOrders = db.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE status = 'waiting_payment'
  `).get();

  const activeOrders = db.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE status IN ('paid', 'in_progress', 'ready')
  `).get();

  const lowStockCount = db.prepare(`
    SELECT COUNT(*) as count FROM ingredients WHERE stock <= min_stock
  `).get();

  res.json({
    success: true,
    data: {
      today_revenue: todaySales.revenue,
      today_orders: todaySales.count,
      total_orders: totalOrders.count,
      pending_orders: pendingOrders.count,
      active_orders: activeOrders.count,
      low_stock_count: lowStockCount.count
    }
  });
});

// GET /api/reports/sales - Protected: sales report by period
router.get('/sales', authenticateToken, (req, res) => {
  const { period = 'daily', date_from, date_to } = req.query;

  let groupBy, dateFormat;
  switch (period) {
    case 'weekly': groupBy = "strftime('%Y-W%W', created_at)"; dateFormat = '%Y-W%W'; break;
    case 'monthly': groupBy = "strftime('%Y-%m', created_at)"; dateFormat = '%Y-%m'; break;
    default: groupBy = "DATE(created_at)"; dateFormat = '%Y-%m-%d';
  }

  let whereClause = "WHERE status NOT IN ('cancelled', 'waiting_payment')";
  const params = [];
  if (date_from) { whereClause += ' AND DATE(created_at) >= ?'; params.push(date_from); }
  if (date_to) { whereClause += ' AND DATE(created_at) <= ?'; params.push(date_to); }

  const data = db.prepare(`
    SELECT
      strftime('${dateFormat}', created_at) as period,
      COUNT(*) as order_count,
      SUM(total_amount) as revenue,
      AVG(total_amount) as avg_order_value
    FROM orders
    ${whereClause}
    GROUP BY ${groupBy}
    ORDER BY period DESC
    LIMIT 30
  `).all(...params);

  res.json({ success: true, data });
});

// GET /api/reports/top-menus - Protected: best selling menus
router.get('/top-menus', authenticateToken, (req, res) => {
  const { limit = 10, date_from, date_to } = req.query;

  let joinWhere = "WHERE o.status NOT IN ('cancelled', 'waiting_payment')";
  const params = [];
  if (date_from) { joinWhere += ' AND DATE(o.created_at) >= ?'; params.push(date_from); }
  if (date_to) { joinWhere += ' AND DATE(o.created_at) <= ?'; params.push(date_to); }

  const data = db.prepare(`
    SELECT
      oi.menu_id,
      oi.menu_name,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.subtotal) as total_revenue,
      COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    ${joinWhere}
    GROUP BY oi.menu_id, oi.menu_name
    ORDER BY total_quantity DESC
    LIMIT ?
  `).all(...params, parseInt(limit));

  res.json({ success: true, data });
});

// GET /api/reports/transactions - Protected: full transaction history
router.get('/transactions', authenticateToken, (req, res) => {
  const { date_from, date_to, status, payment_method, limit = 100, offset = 0 } = req.query;

  let where = 'WHERE 1=1';
  const params = [];
  if (date_from) { where += ' AND DATE(o.created_at) >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND DATE(o.created_at) <= ?'; params.push(date_to); }
  if (status && status !== 'all') { where += ' AND o.status = ?'; params.push(status); }
  if (payment_method && payment_method !== 'all') { where += ' AND o.payment_method = ?'; params.push(payment_method); }

  const orders = db.prepare(`
    SELECT o.*,
      GROUP_CONCAT(oi.menu_name || ' x' || oi.quantity, ', ') as items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${where}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), parseInt(offset));

  const totalCount = db.prepare(`SELECT COUNT(*) as count FROM orders o ${where}`).get(...params);

  res.json({ success: true, data: orders, total: totalCount.count });
});

module.exports = router;
