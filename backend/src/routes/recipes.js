const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/recipes - Protected: get all recipes grouped by menu
router.get('/', authenticateToken, (req, res) => {
  const recipes = db.prepare(`
    SELECT r.id, r.menu_id, r.ingredient_id, r.quantity_needed,
           m.name as menu_name, i.name as ingredient_name, i.unit
    FROM recipes r
    JOIN menus m ON r.menu_id = m.id
    JOIN ingredients i ON r.ingredient_id = i.id
    ORDER BY m.name, i.name
  `).all();
  res.json({ success: true, data: recipes });
});

// GET /api/recipes/menu/:menuId - Get recipes for a specific menu
router.get('/menu/:menuId', (req, res) => {
  const recipes = db.prepare(`
    SELECT r.id, r.quantity_needed, i.id as ingredient_id,
           i.name as ingredient_name, i.unit, i.stock
    FROM recipes r
    JOIN ingredients i ON r.ingredient_id = i.id
    WHERE r.menu_id = ?
  `).all(req.params.menuId);
  res.json({ success: true, data: recipes });
});

// POST /api/recipes - Protected: add recipe item
router.post('/', authenticateToken, (req, res) => {
  const { menu_id, ingredient_id, quantity_needed } = req.body;
  if (!menu_id || !ingredient_id || !quantity_needed) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES (?, ?, ?)
    `).run(menu_id, ingredient_id, parseFloat(quantity_needed));

    const newRecipe = db.prepare(`
      SELECT r.*, m.name as menu_name, i.name as ingredient_name, i.unit
      FROM recipes r JOIN menus m ON r.menu_id=m.id JOIN ingredients i ON r.ingredient_id=i.id
      WHERE r.id=?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newRecipe });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Bahan ini sudah ada dalam resep' });
    }
    throw err;
  }
});

// PUT /api/recipes/:id - Protected: update recipe quantity
router.put('/:id', authenticateToken, (req, res) => {
  const { quantity_needed } = req.body;
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ success: false, message: 'Resep tidak ditemukan' });

  db.prepare('UPDATE recipes SET quantity_needed=? WHERE id=?').run(parseFloat(quantity_needed), req.params.id);
  res.json({ success: true, message: 'Resep diperbarui' });
});

// DELETE /api/recipes/:id - Protected: remove recipe item
router.delete('/:id', authenticateToken, (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ success: false, message: 'Resep tidak ditemukan' });

  db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Resep dihapus' });
});

module.exports = router;
