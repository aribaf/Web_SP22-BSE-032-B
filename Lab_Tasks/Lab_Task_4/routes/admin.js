// routes/admin.js
const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const Product = require('../models/Product');
const Order = require('../models/Order');

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

// View orders
router.get('/orders', isAdmin, async (req, res) => {
  const orders = await Order.find();
  res.render('admin/orders', { orders });
});

module.exports = router;
