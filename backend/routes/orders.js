const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Ensure we use v2 for security
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * 1. CLOUDINARY CONFIGURATION (Secure v2)
 * Connects using your .env credentials
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * 2. CLOUDINARY STORAGE SETUP
 * Configures Multer to send images directly to the Cloudinary cloud
 */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'payment_receipts', // Folder name inside Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optional: resizes huge images
    },
});

const upload = multer({ storage: storage });

/**
 * 3. POST: CREATE NEW ORDER & UPDATE SALES
 * Triggered when a customer submits their bag and CBE/Bank receipt
 */
router.post('/', upload.single('screenshot'), async (req, res) => {
    try {
        console.log("📥 Incoming Order Request (Cloudinary Storage)...");

        // Check if image upload worked
        if (!req.file) {
            console.log("❌ No screenshot provided by client.");
            return res.status(400).json({ 
                success: false, 
                message: "Payment receipt image is required!" 
            });
        }

        // Parse the order data sent as a string in FormData
        const orderData = JSON.parse(req.body.order);

        // Create the Order in MongoDB
        // req.file.path contains the permanent HTTPS link from Cloudinary
        const newOrder = new Order({
            items: orderData.items,
            total: orderData.total,
            customer: {
                name: orderData.customer.name,
                phone: orderData.customer.phone,
                address: orderData.customer.address
            },
            paymentScreenshot: req.file.path, // PERMANENT URL
            status: 'Pending Verification'
        });

        await newOrder.save();
        console.log("✅ Order saved with Cloud Link.");

        // --- AUTOMATIC SALES COUNTER ---
        // Increments 'boughtLastMonth' for every series in the bag
        if (orderData.items && orderData.items.length > 0) {
            for (const item of orderData.items) {
                try {
                    await Product.findByIdAndUpdate(item.id, { 
                        $inc: { boughtLastMonth: 1 } 
                    });
                    console.log(`📈 Analytics: Sales +1 for item ID: ${item.id}`);
                } catch (updateErr) {
                    console.error(`⚠️ Sales update failed for ID: ${item.id}`);
                }
            }
        }
        
        // Final Success Response
        return res.status(200).json({ 
            success: true, 
            message: "successfully ordered" 
        });

    } catch (err) {
        console.error("❌ Backend Order Error:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server error during order processing."
        });
    }
});

/**
 * 4. GET: FETCH ALL ORDERS (Admin Dashboard)
 */
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("❌ Fetch Error:", err);
        res.status(500).json({ success: false, message: "Error fetching orders." });
    }
});

/**
 * 5. DELETE: REMOVE AN ORDER
 */
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false });
        
        console.log(`🗑️ Deleted Order: ${req.params.id}`);
        res.json({ success: true, message: "Order record deleted." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Delete failed." });
    }
});

module.exports = router;