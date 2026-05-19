const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const Order = require('./models/Order');

const app = express();

// Database Container Pipeline Sync
mongoose.connect('mongodb://127.0.0.1:27017/finallab_db')
    .then(async () => {
        console.log('Database synchronization connection linked! 🚀');
        
        // AUTO-SEEDER DATA: Automatically seeds sample orders if database collection is empty
        const count = await Order.countDocuments();
        if (count === 0) {
            await Order.create([
                { productName: 'Laptop Computer', price: 1200, quantity: 1 },
                { productName: 'Mechanical Keyboard', price: 150, quantity: 2 },
                { productName: 'Wireless Mouse', price: 50, quantity: 3 }
            ]);
            console.log('Sample data matrices successfully seeded into DB cluster.');
        }
    })
    .catch(err => console.error('Database configuration interface error:', err));

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.json());

// ASYNC HELPER FACTORY TO CALCULATE FINANCIAL METRICS
async function calculateSalesMetrics() {
    const orders = await Order.find();
    let totalRevenue = 0;
    orders.forEach(order => {
        totalRevenue += (order.price * order.quantity);
    });
    return {
        totalRevenue: totalRevenue,
        totalOrders: orders.length
    };
}

// ------------------- ENDPOINT PIPELINES -------------------

// 1. Server-Side Compiled Dashboard View Endpoint (Requirement 2)
app.get('/sales', async (req, res) => {
    try {
        const metrics = await calculateSalesMetrics();
        res.render('sales', {
            totalRevenue: metrics.totalRevenue,
            totalOrders: metrics.metrics || metrics.totalOrders
        });
    } catch (err) {
        res.status(500).send("Fatal error computing reporting views.");
    }
});

// 2. Secondary Live System Update API JSON Endpoint (Requirement 3)
app.get('/api/sales-data', async (req, res) => {
    try {
        const metrics = await calculateSalesMetrics();
        res.json({
            totalRevenue: metrics.totalRevenue,
            totalOrders: metrics.totalOrders
        });
    } catch (err) {
        res.status(500).json({ error: "Internal API processing disruption error." });
    }
});

app.listen(3000, () => console.log('Real-Time Engine server initialized at: http://localhost:3000/sales'));