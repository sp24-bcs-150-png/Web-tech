const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Schemas and Guards
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { verifyToken } = require('../middleware/auth');

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// 1. Fetch All Products with optional pagination filtering
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skipIndex = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find().skip(skipIndex).limit(limit);

        res.status(200).json({
            count: products.length,
            total: totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            data: products
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve inventory catalog listings.' });
    }
});

// 2. Fetch Single Product Metadata details
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product SKU identification signature not found.' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: 'Malformed parameters tracking inventory targets.' });
    }
});

// 3. User Authorization Registry (For Testing Validation)
router.post('/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Identity collision: Profile already active.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword, role });
        res.status(201).json({ message: 'User identity compiled.', userId: newUser._id });
    } catch (err) {
        res.status(500).json({ error: 'Account registry tracking subsystem fault.' });
    }
});

// 4. JWT Sign-In Gateway Verification (Requirement 2)
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid login credential parameter matching.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid login credential parameter matching.' });

        // TOKEN SIGNING GENERATION PROCESS
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Authentication validated successfully.',
            token: `Bearer ${token}`
        });
    } catch (err) {
        res.status(500).json({ error: 'Credential processing node breakdown.' });
    }
});

// ==========================================
// PROTECTED ENDPOINTS (Requires JWT Token Authorization)
// ==========================================

// 5. User Security Account Metadata Profile (Requirement 1)
router.get('/user/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'System profiling records pipeline failure.' });
    }
});

// 6. Finalize Checkout Order Placement (Requirement 1)
router.post('/orders', verifyToken, async (req, res) => {
    const { products, totalAmount } = req.body;
    try {
        const newOrder = await Order.create({
            userId: req.user.id,
            products,
            totalAmount
        });
        res.status(201).json({ message: 'Order tracking matrix committed successfully.', orderDetails: newOrder });
    } catch (err) {
        res.status(500).json({ error: 'Transactional sequence error during processing.' });
    }
});

module.exports = router;