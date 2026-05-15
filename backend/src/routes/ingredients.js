const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/ingredients - Protected: list all ingredients with low-stock flag
router.get('/', authenticateToken, (req, res) => {
  const ingredients = db.prepare(`
    SELECT *, (stock <= min_stock) as is_low_stock FROM ingredients ORDER BY name
  `).all();
  res.json({ success: true, data: ingredients });
});

// GET /api/ingredients/low-stock - Protected: only low stock items
router.get('/low-stock', authenticateToken, (req, res) => {
  const items = db.prepare(`
    SELECT * FROM ingredients WHERE stock <= min_stock ORDER BY name
  `).all();
  res.json({ success: true, data: items, count: items.length });
});

// GET /api/ingredients/:id
router.get('/:id', authenticateToken, (req, res) => {
  const item = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Bahan tidak ditemukan' });
  res.json({ success: true, data: item });
});

// POST /api/ingredients - Protected: create ingredient
router.post('/', authenticateToken, (req, res) => {
  const { name, unit, stock, min_stock } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Nama bahan wajib diisi' });

  const result = db.prepare(`
    INSERT INTO ingredients (name, unit, stock, min_stock) VALUES (?, ?, ?, ?)
  `).run(name, unit || 'gram', parseFloat(stock) || 0, parseFloat(min_stock) || 0);

  const newItem = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: newItem });
});

// PUT /api/ingredients/:id - Protected: update ingredient
router.put('/:id', authenticateToken, (req, res) => {
  const item = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Bahan tidak ditemukan' });

  const { name, unit, stock, min_stock } = req.body;

  db.prepare(`
    UPDATE ingredients SET name=?, unit=?, stock=?, min_stock=? WHERE id=?
  `).run(
    name || item.name,
    unit || item.unit,
    stock !== undefined ? parseFloat(stock) : item.stock,
    min_stock !== undefined ? parseFloat(min_stock) : item.min_stock,
    req.params.id
  );

  const updated = db.prepare('SELECT *, (stock <= min_stock) as is_low_stock FROM ingredients WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: updated });
});

// DELETE /api/ingredients/:id - Protected
router.delete('/:id', authenticateToken, (req, res) => {
  const item = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Bahan tidak ditemukan' });

  db.prepare('DELETE FROM ingredients WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Bahan berhasil dihapus' });
});

module.exports = router;
