const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Express Settings
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));

// Fake (Mock) Sales Data - Initial State
let fakeSalesData = {
    totalRevenue: 5000,
    totalOrders: 42
};

// Auto update every 10 seconds
setInterval(() => {
    fakeSalesData.totalOrders += Math.floor(Math.random() * 3) + 1;
    fakeSalesData.totalRevenue += Math.floor(Math.random() * 150) + 50;
    console.log("Background data updated:", fakeSalesData);
}, 10000);

// Home Route
app.get('/', (req, res) => {
    res.render('index', { title: 'Khaadi Online Store' });
});

// Sales Dashboard Route
app.get('/sales', (req, res) => {
    res.render('sales', { title: 'Sales Dashboard', data: fakeSalesData });
});

// API Route
app.get('/api/sales-data', (req, res) => {
    res.json(fakeSalesData);
});

// Server Start
app.listen(3000, () => {
    console.log('Server running at: http://localhost:3000/sales');
});