const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    items: Array,
    total: Number,
    customer: { name: String, phone: String, address: String },
    paymentScreenshot: String, // Store filename
    status: { type: String, default: 'Pending Verification' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema);