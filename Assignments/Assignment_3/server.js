console.log("🚀 Starting server.js...");

const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');

// Middleware setup
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'jigsaw-secret',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Dummy user database (for testing purposes)
const users = [];

// Sample product list
const productList = [
  { name: 'Linen Dress', price: '$50', image: '1.webp', description: 'Light and breathable linen dress.' },
  { name: 'Spring Jacket', price: '$85', image: '2.webp', description: 'Warm, stylish outerwear for spring.' },
  { name: 'Denim Shirt', price: '$40', image: '3.webp', description: 'Classic look with modern fit.' }
];

// Routes
app.get('/', (req, res) => {
  res.render('home', { layout: 'layout', user: req.session.user });
});

app.get('/products', (req, res) => {
  res.render('products', { layout: 'layout', user: req.session.user, products: productList });
});

app.get('/about', (req, res) => {
  res.render('about', { layout: 'layout', user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login', { layout: 'layout' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.send('Invalid username or password. <a href="/login">Try again</a>');
  }
});

app.get('/register', (req, res) => {
  res.render('register', { layout: 'layout' });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.send('Username already exists. <a href="/register">Try again</a>');
  }
  users.push({ username, password });
  res.redirect('/login');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));