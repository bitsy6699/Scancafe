require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./database');

async function seed() {
  initializeDatabase();

  console.log('🌱 Seeding database...');

  // Clear existing data
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM recipes;
    DELETE FROM menus;
    DELETE FROM ingredients;
    DELETE FROM users;
  `);

  // --- Users ---
  const hashedPassword = bcrypt.hashSync('password123', 10);
  db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`).run(
    'Admin ScanCafe', 'admin@scancafe.com', hashedPassword, 'pegawai'
  );

  // --- Ingredients ---
  const ingredients = [
    { name: 'Biji Kopi Espresso', unit: 'gram', stock: 2000, min_stock: 500 },
    { name: 'Susu Segar', unit: 'ml', stock: 5000, min_stock: 1000 },
    { name: 'Air Panas', unit: 'ml', stock: 10000, min_stock: 2000 },
    { name: 'Gula Pasir', unit: 'gram', stock: 3000, min_stock: 500 },
    { name: 'Tepung Terigu', unit: 'gram', stock: 5000, min_stock: 1000 },
    { name: 'Mentega', unit: 'gram', stock: 2000, min_stock: 300 },
    { name: 'Cokelat Bubuk', unit: 'gram', stock: 1000, min_stock: 200 },
    { name: 'Vanilla Syrup', unit: 'ml', stock: 800, min_stock: 150 },
    { name: 'Es Batu', unit: 'gram', stock: 5000, min_stock: 1000 },
    { name: 'Matcha Powder', unit: 'gram', stock: 500, min_stock: 100 },
    { name: 'Karamel Syrup', unit: 'ml', stock: 600, min_stock: 100 },
    { name: 'Keju Parut', unit: 'gram', stock: 800, min_stock: 150 },
  ];

  const insertIngredient = db.prepare(
    `INSERT INTO ingredients (name, unit, stock, min_stock) VALUES (?, ?, ?, ?)`
  );
  ingredients.forEach(i => insertIngredient.run(i.name, i.unit, i.stock, i.min_stock));

  // --- Menus ---
  const menus = [
    { name: 'Espresso', description: 'Kopi espresso murni, tebal dan kaya rasa', price: 18000, category: 'drinks', image_url: '/images/espresso.jpg', is_available: 1 },
    { name: 'Americano', description: 'Espresso dilarutkan dengan air panas', price: 22000, category: 'drinks', image_url: '/images/americano.jpg', is_available: 1 },
    { name: 'Cappuccino', description: 'Espresso dengan steamed milk dan foam', price: 28000, category: 'drinks', image_url: '/images/cappuccino.jpg', is_available: 1 },
    { name: 'Caffe Latte', description: 'Espresso dengan susu segar yang lembut', price: 30000, category: 'drinks', image_url: '/images/latte.jpg', is_available: 1 },
    { name: 'Vanilla Latte', description: 'Latte dengan sentuhan vanilla syrup', price: 35000, category: 'drinks', image_url: '/images/vanilla-latte.jpg', is_available: 1 },
    { name: 'Caramel Macchiato', description: 'Espresso, susu, dan siraman karamel', price: 38000, category: 'drinks', image_url: '/images/caramel-macchiato.jpg', is_available: 1 },
    { name: 'Matcha Latte', description: 'Matcha premium dengan susu segar', price: 35000, category: 'drinks', image_url: '/images/matcha-latte.jpg', is_available: 1 },
    { name: 'Iced Chocolate', description: 'Cokelat dingin yang kaya dan creamy', price: 32000, category: 'drinks', image_url: '/images/iced-choco.jpg', is_available: 1 },
    { name: 'Croissant', description: 'Croissant butter renyah berlapis-lapis', price: 22000, category: 'food', image_url: '/images/croissant.jpg', is_available: 1 },
    { name: 'Cheese Croissant', description: 'Croissant isi keju parut meleleh', price: 28000, category: 'food', image_url: '/images/cheese-croissant.jpg', is_available: 1 },
    { name: 'Banana Bread', description: 'Roti pisang homemade yang lembut', price: 25000, category: 'food', image_url: '/images/banana-bread.jpg', is_available: 1 },
    { name: 'Chocolate Muffin', description: 'Muffin cokelat lembut dan moist', price: 20000, category: 'food', image_url: '/images/choco-muffin.jpg', is_available: 1 },
  ];

  const insertMenu = db.prepare(
    `INSERT INTO menus (name, description, price, category, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)`
  );
  menus.forEach(m => insertMenu.run(m.name, m.description, m.price, m.category, m.image_url, m.is_available));

  // --- Recipes ---
  // Get IDs
  const allMenus = db.prepare('SELECT id, name FROM menus').all();
  const allIngredients = db.prepare('SELECT id, name FROM ingredients').all();

  const getMenuId = (name) => allMenus.find(m => m.name === name)?.id;
  const getIngId = (name) => allIngredients.find(i => i.name === name)?.id;

  const insertRecipe = db.prepare(
    `INSERT OR IGNORE INTO recipes (menu_id, ingredient_id, quantity_needed) VALUES (?, ?, ?)`
  );

  const recipes = [
    // Espresso
    { menu: 'Espresso', ingredient: 'Biji Kopi Espresso', qty: 18 },
    { menu: 'Espresso', ingredient: 'Air Panas', qty: 30 },
    // Americano
    { menu: 'Americano', ingredient: 'Biji Kopi Espresso', qty: 18 },
    { menu: 'Americano', ingredient: 'Air Panas', qty: 150 },
    // Cappuccino
    { menu: 'Cappuccino', ingredient: 'Biji Kopi Espresso', qty: 18 },
    { menu: 'Cappuccino', ingredient: 'Susu Segar', qty: 120 },
    { menu: 'Cappuccino', ingredient: 'Air Panas', qty: 30 },
    // Caffe Latte
    { menu: 'Caffe Latte', ingredient: 'Biji Kopi Espresso', qty: 18 },
    { menu: 'Caffe Latte', ingredient: 'Susu Segar', qty: 200 },
    // Vanilla Latte
    { menu: 'Vanilla Latte', ingredient: 'Biji Kopi Espresso', qty: 18 },
    { menu: 'Vanilla Latte', ingredient: 'Susu Segar', qty: 200 },
    { menu: 'Vanilla Latte', ingredient: 'Vanilla Syrup', qty: 20 },
    // Caramel Macchiato
    { menu: 'Caramel Macchiato', ingredient: 'Biji Kopi Espresso', qty: 18 },
    { menu: 'Caramel Macchiato', ingredient: 'Susu Segar', qty: 180 },
    { menu: 'Caramel Macchiato', ingredient: 'Karamel Syrup', qty: 25 },
    // Matcha Latte
    { menu: 'Matcha Latte', ingredient: 'Matcha Powder', qty: 8 },
    { menu: 'Matcha Latte', ingredient: 'Susu Segar', qty: 200 },
    { menu: 'Matcha Latte', ingredient: 'Gula Pasir', qty: 10 },
    // Iced Chocolate
    { menu: 'Iced Chocolate', ingredient: 'Cokelat Bubuk', qty: 25 },
    { menu: 'Iced Chocolate', ingredient: 'Susu Segar', qty: 200 },
    { menu: 'Iced Chocolate', ingredient: 'Gula Pasir', qty: 15 },
    { menu: 'Iced Chocolate', ingredient: 'Es Batu', qty: 150 },
    // Croissant
    { menu: 'Croissant', ingredient: 'Tepung Terigu', qty: 80 },
    { menu: 'Croissant', ingredient: 'Mentega', qty: 40 },
    { menu: 'Croissant', ingredient: 'Gula Pasir', qty: 10 },
    // Cheese Croissant
    { menu: 'Cheese Croissant', ingredient: 'Tepung Terigu', qty: 80 },
    { menu: 'Cheese Croissant', ingredient: 'Mentega', qty: 40 },
    { menu: 'Cheese Croissant', ingredient: 'Keju Parut', qty: 30 },
    // Banana Bread
    { menu: 'Banana Bread', ingredient: 'Tepung Terigu', qty: 100 },
    { menu: 'Banana Bread', ingredient: 'Gula Pasir', qty: 30 },
    { menu: 'Banana Bread', ingredient: 'Mentega', qty: 30 },
    // Chocolate Muffin
    { menu: 'Chocolate Muffin', ingredient: 'Tepung Terigu', qty: 90 },
    { menu: 'Chocolate Muffin', ingredient: 'Cokelat Bubuk', qty: 20 },
    { menu: 'Chocolate Muffin', ingredient: 'Gula Pasir', qty: 25 },
    { menu: 'Chocolate Muffin', ingredient: 'Mentega', qty: 25 },
  ];

  recipes.forEach(r => {
    const menuId = getMenuId(r.menu);
    const ingId = getIngId(r.ingredient);
    if (menuId && ingId) insertRecipe.run(menuId, ingId, r.qty);
  });

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Demo account:');
  console.log('  Email   : admin@scancafe.com');
  console.log('  Password: password123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
