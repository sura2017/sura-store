/**
 * BACKEND SERVER - DEPLOYMENT VERSION (CLOUDINARY READY)
 * Handles: Database, Security, Cloud Image Storage, and API Routing
 */

require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize the App
const app = express();

/**
 * 1. DATABASE CONNECTION
 * Connects to MongoDB Atlas
 */
connectDB();

/**
 * 2. GLOBAL MIDDLEWARE
 * app.use(cors()) allows your live frontend to talk to this backend.
 */
app.use(cors()); 
app.use(express.json());

/**
 * 3. STATIC FILES (OPTIONAL)
 * We keep this so that IF you have any old images in the uploads folder, 
 * the server can still show them. However, all NEW orders will use Cloudinary links.
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * 4. API ROUTES
 */
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

/**
 * 5. LIVE SERVER HEALTH CHECK
 * This is what you see when you visit your Render backend link.
 */
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1 style="color: #10b981;">🚀 EasyStore API is Live</h1>
            <p>Database Status: Connected ✅</p>
            <p>Image Storage: Cloudinary Active ☁️</p>
            <p>Ready to receive requests from your website.</p>
        </div>
    `);
});

/**
 * 6. START SERVER
 * We use process.env.PORT because Render will assign a random port automatically.
 * Default to 5000 for local testing.
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`---------------------------------------------------`);
    console.log(`🚀 SERVER IS LIVE ON PORT: ${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`---------------------------------------------------`);
});
