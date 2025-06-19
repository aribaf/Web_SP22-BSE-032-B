const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Vehicle = require('../models/Vehicle');
const upload = require('../middleware/upload');

// ----- PRODUCT ROUTES -----

// Show all products
router.get('/products', isAdmin, async (req, res) => {
  const products = await Product.find();
  res.render('admin/products', { products });
});

// Add product
router.get('/products/add', isAdmin, (req, res) => {
  res.render('admin/add-product');
});

router.post('/products/add', isAdmin, async (req, res) => {
  const { title, price, description, imageUrl } = req.body;
  await Product.create({ title, price, description, imageUrl });
  res.redirect('/admin/products');
});

// Edit product
router.get('/products/edit/:id', isAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('admin/edit-product', { product });
});

router.post('/products/edit/:id', isAdmin, async (req, res) => {
  const { title, price, description, imageUrl } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { title, price, description, imageUrl });
  res.redirect('/admin/products');
});

// Delete product
router.post('/products/delete/:id', isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products');
});

// ----- ORDER ROUTES -----

router.get('/orders', isAdmin, async (req, res) => {
  const orders = await Order.find();
  res.render('admin/orders', { orders });
});

// ----- VEHICLE ROUTES -----

// View all vehicles
router.get('/vehicles', isAdmin, async (req, res) => {
  const vehicles = await Vehicle.find();
  res.render('admin/vehicles', { vehicles });
});

// Add vehicle form
router.get('/add-vehicle', isAdmin, (req, res) => {
  res.render('admin/add-vehicle');
});

// Add vehicle (POST)
router.post('/add-vehicle', isAdmin, upload.single('image'), async (req, res) => {
  const { name, brand, price, type } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !brand || !price || !type || !image) return res.send('All fields required.');

  const vehicle = new Vehicle({ name, brand, price, type, image });
  await vehicle.save();
  res.redirect('/admin/vehicles');
});

// Edit vehicle form
router.get('/edit-vehicle/:id', isAdmin, async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  res.render('admin/edit-vehicle', { vehicle });
});

// Edit vehicle (POST)
router.post('/edit-vehicle/:id', isAdmin, upload.single('image'), async (req, res) => {
  const { name, brand, price, type } = req.body;
  const update = { name, brand, price, type };

  if (req.file) update.image = req.file.filename;

  await Vehicle.findByIdAndUpdate(req.params.id, update);
  res.redirect('/admin/vehicles');
});

// Delete vehicle
router.post('/delete-vehicle/:id', isAdmin, async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.redirect('/admin/vehicles');
});

module.exports = router;
