console.log("🚀 Starting server.js...");

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const User = require('./models/User'); // ✅ import User model

const app = express();

// ✅ MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/jigsaw', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('🟢 Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Order model
const Order = mongoose.model('Order', {
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  phone: String,
  address: String,
  items: Array,
  total: Number,
  status: { type: String, default: 'Pending' }
});

// ✅ Config
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Session config
app.use(session({
  secret: 'jigsaw-secret',
  resave: false,
  saveUninitialized: true
}));

// ✅ Global middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  if (!req.session.cart) req.session.cart = [];
  next();
});

// ✅ Middleware: Protect route
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// ✅ Sample products
const productList = [
  { name: 'Linen Dress', price: '$50', image: '1.webp', description: 'Light and breathable linen dress.' },
  { name: 'Spring Jacket', price: '$85', image: '2.webp', description: 'Warm, stylish outerwear for spring.' },
  { name: 'Denim Shirt', price: '$40', image: '3.webp', description: 'Classic look with modern fit.' }
];

// ✅ Routes
app.get('/', (req, res) => {
  res.render('home', { layout: 'layout' });
});

app.get('/products', (req, res) => {
  res.render('products', { layout: 'layout', products: productList });
});

app.get('/about', (req, res) => {
  res.render('about', { layout: 'layout' });
});

// ✅ Cart
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
  res.render('cart', { layout: 'layout', cart, total });
});

// ✅ Checkout
app.get('/checkout', requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('checkout', { layout: 'layout', total });
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

// ✅ /my-orders (protected)
app.get('/my-orders', requireLogin, async (req, res) => {
  const orders = await Order.find({ userId: req.session.user._id });
  res.render('my-orders', { layout: 'layout', orders });
});

// ✅ Auth routes
app.get('/login', (req, res) => {
  res.render('login', { layout: 'layout' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.send('Invalid credentials. <a href="/login">Try again</a>');
  req.session.user = user;
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register', { layout: 'layout' });
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

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
