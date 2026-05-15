const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Setup multer for image upload
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `menu_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/menus - Public: list all available menus
router.get('/', (req, res) => {
  const { category, available } = req.query;
  let query = 'SELECT * FROM menus WHERE 1=1';
  const params = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (available === 'true') { query += ' AND is_available = 1'; }

  query += ' ORDER BY category, name';
  const menus = db.prepare(query).all(...params);
  res.json({ success: true, data: menus });
});

// GET /api/menus/:id - Public: single menu with recipe
router.get('/:id', (req, res) => {
  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id);
  if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });

  const recipe = db.prepare(`
    SELECT r.id, r.quantity_needed, i.id as ingredient_id, i.name as ingredient_name, i.unit, i.stock
    FROM recipes r JOIN ingredients i ON r.ingredient_id = i.id
    WHERE r.menu_id = ?
  `).all(req.params.id);

  res.json({ success: true, data: { ...menu, recipe } });
});

// POST /api/menus - Protected: create menu
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  const { name, description, price, category } = req.body;
  if (!name || !price) return res.status(400).json({ success: false, message: 'Nama dan harga wajib diisi' });

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db.prepare(`
    INSERT INTO menus (name, description, price, category, image_url, is_available)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(name, description || '', parseFloat(price), category || 'drinks', image_url);

  const newMenu = db.prepare('SELECT * FROM menus WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: newMenu });
});

// PUT /api/menus/:id - Protected: update menu
router.put('/:id', authenticateToken, upload.single('image'), (req, res) => {
  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id);
  if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });

  const { name, description, price, category, is_available } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : menu.image_url;

  db.prepare(`
    UPDATE menus SET name=?, description=?, price=?, category=?, image_url=?, is_available=?
    WHERE id=?
  `).run(
    name || menu.name,
    description !== undefined ? description : menu.description,
    price ? parseFloat(price) : menu.price,
    category || menu.category,
    image_url,
    is_available !== undefined ? parseInt(is_available) : menu.is_available,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: updated });
});

// PATCH /api/menus/:id/availability - Protected: toggle availability
router.patch('/:id/availability', authenticateToken, (req, res) => {
  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id);
  if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });

  const newStatus = menu.is_available ? 0 : 1;
  db.prepare('UPDATE menus SET is_available=? WHERE id=?').run(newStatus, req.params.id);
  res.json({ success: true, data: { is_available: newStatus } });
});

// DELETE /api/menus/:id - Protected: delete menu
router.delete('/:id', authenticateToken, (req, res) => {
  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id);
  if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });

  db.prepare('DELETE FROM menus WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Menu berhasil dihapus' });
});

module.exports = router;
