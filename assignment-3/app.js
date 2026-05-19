const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.set('view engine', 'ejs');
app.use(expressLayouts);

// Seed Data: 25 Sample Products (As per assignment requirement)
const sampleProducts = [
    { name: "iPhone 15 Pro", price: 1200, category: "Electronics", rating: 4.8, stock: 15 },
    { name: "Samsung Galaxy S24", price: 1000, category: "Electronics", rating: 4.7, stock: 20 },
    { name: "Sony Headphones WH-1000XM5", price: 350, category: "Electronics", rating: 4.9, stock: 30 },
    { name: "Dell XPS 13 Laptop", price: 1400, category: "Electronics", rating: 4.6, stock: 10 },
    { name: "Apple Watch Series 9", price: 400, category: "Electronics", rating: 4.5, stock: 25 },
    { name: "Nike Air Max Sneakers", price: 150, category: "Fashion", rating: 4.4, stock: 50 },
    { name: "Levi's 501 Original Jeans", price: 80, category: "Fashion", rating: 4.3, stock: 40 },
    { name: "Zara Leather Jacket", price: 200, category: "Fashion", rating: 4.2, stock: 12 },
    { name: "Adidas Running Shoes", price: 120, category: "Fashion", rating: 4.5, stock: 35 },
    { name: "Gucci Sunglasses", price: 300, category: "Fashion", rating: 4.1, stock: 8 },
    { name: "Coffee Maker Machine", price: 90, category: "Home", rating: 4.4, stock: 18 },
    { name: "Dyson Vacuum Cleaner", price: 500, category: "Home", rating: 4.7, stock: 14 },
    { name: "Comfortable Sofa Chair", price: 250, category: "Home", rating: 4.3, stock: 7 },
    { name: "LED Desk Lamp", price: 30, category: "Home", rating: 4.6, stock: 60 },
    { name: "Non-Stick Frying Pan", price: 45, category: "Home", rating: 4.2, stock: 22 },
    { name: "iPad Air", price: 600, category: "Electronics", rating: 4.7, stock: 19 },
    { name: "Puma Hoodie", price: 65, category: "Fashion", rating: 4.3, stock: 28 },
    { name: "Blender Juicer", price: 75, category: "Home", rating: 4.1, stock: 15 },
    { name: "Gaming Mouse", price: 50, category: "Electronics", rating: 4.6, stock: 45 },
    { name: "Mechanical Keyboard", price: 110, category: "Electronics", rating: 4.8, stock: 33 },
    { name: "Casual T-Shirt", price: 25, category: "Fashion", rating: 4.0, stock: 100 },
    { name: "Winter Woolen Scarf", price: 20, category: "Fashion", rating: 4.5, stock: 50 },
    { name: "Microwave Oven", price: 180, category: "Home", rating: 4.4, stock: 11 },
    { name: "Air Purifier", price: 220, category: "Home", rating: 4.6, stock: 16 },
    { name: "Smart Door Lock", price: 160, category: "Home", rating: 4.5, stock: 9 }
];

// Main Products Route with Pagination, Searching, and Filtering
app.get('/products', (req, res) => {
    // Get Query Parameters
    let page = parseInt(req.query.page) || 1;
    const limit = 8;

    const search = req.query.search || '';
    const category = req.query.category || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

    // Filter Logic (Search, Category, Price Range)
    let filteredProducts = sampleProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === '' || product.category === category;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Pagination Logic
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages && totalPages > 0) page = totalPages;
    if (page < 1) page = 1;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Render Template
    res.render('products', {
        title: 'Dynamic Product Catalog',
        products: paginatedProducts,
        currentPage: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        filters: { search, category, minPrice: req.query.minPrice, maxPrice: req.query.maxPrice }
    });
});

app.listen(3000, () => {
    console.log('Assignment 3 running at: http://localhost:3000/products');
});