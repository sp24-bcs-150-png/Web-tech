const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();

// 1. CONNECT TO LOCAL MONGODB DATABASE
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce_admin_db')
    .then(() => console.log('Database connected successfully! 🎉'))
    .catch(err => console.log('Database connection error:', err));

// 2. MONGOOSE SCHEMA & MODEL (Requirement 1)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    imagePath: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

// Middlewares
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // To serve uploaded images

// 3. MULTER STORAGE SETUP (Image Upload Management - Requirement 3)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/'); // Images will be stored in this folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// ------------------- REAL DATABASE CRUD ROUTES (Requirement 2) -------------------

// READ: Admin dashboard standard table list view
app.get('/admin', async (req, res) => {
    try {
        const dbProducts = await Product.find(); // Fetch data from MongoDB
        res.render('admin', {
            title: 'Admin Dashboard',
            products: dbProducts
        });
    } catch (err) {
        res.status(500).send("Error while fetching data from database.");
    }
});

// CREATE: Render Add New Form
app.get('/admin/add', (req, res) => {
    res.render('form', {
        title: 'Add New Product',
        isEdit: false,
        product: {}
    });
});

// CREATE: Handle Add submission & save to MongoDB
app.post('/admin/add', upload.single('productImage'), async (req, res) => {
    const { name, price, category, stock } = req.body;

    // Server-side validation
    if (!name || !price || !category || !stock || !req.file) {
        return res.send("Error: Server-side validation failed. Fields are empty.");
    }

    try {
        await Product.create({
            name,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            imagePath: '/uploads/' + req.file.filename // File path
        });

        res.redirect('/admin');
    } catch (err) {
        res.send("Error while saving data into database.");
    }
});

// UPDATE: Render populated edit form
app.get('/admin/edit/:id', async (req, res) => {
    try {
        const foundProduct = await Product.findById(req.params.id);

        if (!foundProduct) {
            return res.send("Product not found!");
        }

        res.render('form', {
            title: 'Edit Product',
            isEdit: true,
            product: foundProduct
        });

    } catch (err) {
        res.send("Invalid product ID.");
    }
});

// UPDATE: Handle saved modifications
app.post('/admin/edit/:id', upload.single('productImage'), async (req, res) => {
    const { name, price, category, stock } = req.body;

    if (!name || !price || !category || !stock) {
        return res.send("Fields cannot be empty!");
    }

    try {
        let updateFields = {
            name,
            price: parseFloat(price),
            category,
            stock: parseInt(stock)
        };

        // Update image only if user uploads a new one
        if (req.file) {
            updateFields.imagePath = '/uploads/' + req.file.filename;
        }

        await Product.findByIdAndUpdate(req.params.id, updateFields);

        res.redirect('/admin');

    } catch (err) {
        res.send("Update failed!");
    }
});

// DELETE: Remove directly from MongoDB collection
app.get('/admin/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        res.redirect('/admin');

    } catch (err) {
        res.send("Delete operation failed.");
    }
});

// Start Server
app.listen(3000, () => {
    console.log('Admin Panel running at: http://localhost:3000/admin');
});