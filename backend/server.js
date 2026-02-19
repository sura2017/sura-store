/**
 * BACKEND SERVER - FINAL PRODUCTION VERSION
 * Optimized for Render.com & Cloudinary
 */

require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize the App
const app = express();

/**
 * 1. STARTUP SECURITY CHECK
 * This helps you debug if your Render Environment Variables are missing.
 */
const requiredEnv = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
requiredEnv.forEach(key => {
    if (!process.env[key]) {
        console.warn(`⚠️ WARNING: Environment variable ${key} is missing!`);
    }
});

/**
 * 2. DATABASE CONNECTION
 */
connectDB();

/**
 * 3. GLOBAL MIDDLEWARE
 * app.use(cors()) allows your live frontend (sura-shop.onrender.com) 
 * to communicate with this brain.
 */
app.use(cors()); 
app.use(express.json());

/**
 * 4. STATIC FILES (Legacy Support)
 * Serves any local files if they exist, though Cloudinary is now primary.
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * 5. API ROUTES
 */
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

/**
 * 6. LIVE SERVER HEALTH CHECK & BRANDING
 * Visit this link to see if your server is awake.
 */
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; height: 100vh;">
            <div style="background: white; display: inline-block; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <h1 style="color: #10b981; margin-bottom: 10px;">🚀 EasyStore API is Live</h1>
                <p style="color: #64748b; font-size: 1.1rem;">Product with Sura Abraham</p>
                <div style="margin-top: 20px; padding: 10px; background: #ecfdf5; color: #065f46; border-radius: 10px; font-weight: bold;">
                    Database Status: Connected ✅
                </div>
                <p style="margin-top: 20px; color: #94a3b8; font-size: 0.8rem;">Ready for secure CBE & Oromia transactions.</p>
            </div>
        </div>
    `);
});

/**
 * 7. GLOBAL ERROR HANDLER
 * Prevents the server from crashing if a route has a bug.
 */
app.use((err, req, res, next) => {
    console.error("🔥 SERVER ERROR:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: err.message 
    });
});

/**
 * 8. START SERVER
 * Render uses process.env.PORT (usually 10000). Local uses 5000.
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`---------------------------------------------------`);
    console.log(`🚀 SERVER IS LIVE ON PORT: ${PORT}`);
    console.log(`🔗 API BASE URL: http://localhost:${PORT}/api`);
    console.log(`☁️  IMAGE STORAGE: Cloudinary Ready`);
    console.log(`---------------------------------------------------`);
});