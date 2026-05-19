require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();

// Parsers for reading incoming application JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Establish secure cluster linkage with DB instance
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Database pipeline linkage successfully synced! 🚀'))
    .catch(err => console.error('Database connection crash logs:', err));

// Route Prefix Injections Setup (Requirement 1)
app.use('/api/v1', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RESTful microservices active on: http://localhost:${PORT}`));