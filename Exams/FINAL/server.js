console.log("🚀 Starting server.js...");

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');

const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
const Product = require('./models/Product');
const adminRoutes = require('./routes/admin');
// Optional: move vehicle route to a separate file
// const vehicleRoutes = require('./routes/vehicle');

const app = express(); // ✅ Initialize app

// View Engine & Layout Setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(expressLayouts);
app.set('layout', 'layout'); // layout.ejs in views root

// Static Files & Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'jigsaw-secret',
  resave: false,
  saveUninitialized: true
}));

// ✅ MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/jigsaw', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('🟢 Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Order Schema
const Order = mongoose.model('Order', {
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  phone: String,
  address: String,
  items: Array,
  total: Number,
  status: { type: String, default: 'Pending' }
});

// ✅ Global Middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  if (!req.session.cart) req.session.cart = [];
  next();
});

// ✅ Auth Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
}

// ✅ Public Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('products', { layout: 'layout', products });
  } catch (err) {
    console.error(err);
    res.send('❌ Error loading products');
  }
});

app.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.render('vehicles', { vehicles });
  } catch (err) {
    console.error(err);
    res.send('Error loading vehicles');
  }
});

// If using external vehicle route file:
// app.use('/', vehicleRoutes);

// ✅ Admin Routes
app.use('/admin', adminRoutes);

// ✅ Cart Routes
app.post('/add-to-cart', (req, res) => {
  const { name, price } = req.body;
  const cart = req.session.cart;
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price: parseFloat(price), quantity: 1 });
  }
  res.redirect('/cart');
});

app.post('/update-cart', (req, res) => {
  const { names, quantities } = req.body;
  const cart = req.session.cart;
  cart.forEach((item, index) => {
    item.quantity = parseInt(quantities[index]);
  });
  res.redirect('/cart');
});

app.post('/remove-from-cart', (req, res) => {
  const { name } = req.body;
  req.session.cart = req.session.cart.filter(item => item.name !== name);
  res.redirect('/cart');
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('cart', { cart, total });
});

// ✅ Checkout & Orders
app.get('/checkout', requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('checkout', { total });
});

app.post('/place-order', requireLogin, async (req, res) => {
  const { name, phone, address } = req.body;
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    await Order.create({
      userId: req.session.user._id,
      name,
      phone,
      address,
      items: cart,
      total
    });
    req.session.cart = [];
    res.send('✅ Order placed successfully! <a href="/">Back to Home</a>');
  } catch (err) {
    console.error(err);
    res.send('❌ Error placing order. Please try again.');
  }
});

app.get('/my-orders', requireLogin, async (req, res) => {
  const orders = await Order.find({ userId: req.session.user._id });
  res.render('my-orders', { orders });
});

// ✅ Authentication Routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.send('Invalid credentials. <a href="/login">Try again</a>');
  req.session.user = user;
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.send('Username already taken. <a href="/register">Try again</a>');
  const user = await User.create({ username, password });
  req.session.user = user;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
