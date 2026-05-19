const mongoose = require('mongoose');

// This tells the database what an Order (receipt) contains
const orderSchema = new mongoose.Schema({
    totalAmount: { 
        type: Number, 
        required: true 
    }, // Total amount of the order

    status: { 
        type: String, 
        default: 'Completed' 
    },

    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Order', orderSchema);