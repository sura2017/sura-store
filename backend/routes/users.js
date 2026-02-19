const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * 1. REGISTER A NEW USER
 * Generally used for customers. 
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ success: true, message: "User created!" });
    } catch (err) { 
        res.status(400).json({ success: false, message: err.message }); 
    }
});

/**
 * 2. LOGIN
 * This is what your frontend/login.html now uses.
 * It checks the database for the username and password.
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username AND password
        const user = await User.findOne({ username, password });
        
        if (user) {
            // Send back the isAdmin status so the frontend can save it to localStorage
            res.json({ 
                success: true, 
                isAdmin: user.isAdmin, 
                username: user.username 
            });
        } else {
            // If password doesn't match the one in MongoDB
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

/**
 * 3. ADMIN PASSWORD RESET (The "Master Key" Logic)
 * Forces the admin user to have the username 'admin' and updates the password.
 */
router.post('/reset-admin-password', async (req, res) => {
    try {
        const { recoveryCode, newPassword } = req.body;

        // 1. Verify the Master Recovery Code from your .env file
        if (!recoveryCode || recoveryCode !== process.env.ADMIN_RECOVERY_CODE) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized: Invalid Master Recovery Code!" 
            });
        }

        // 2. Validate the new password
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ 
                success: false, 
                message: "New password must be at least 4 characters." 
            });
        }

        // 3. Find the admin user (specifically searching for username 'admin')
        let admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            // If the 'admin' user doesn't exist at all, we create it here
            console.log("Creating brand new admin account...");
            admin = new User({
                username: 'admin',
                password: newPassword,
                isAdmin: true
            });
        } else {
            // If the 'admin' user exists, we just update the password
            admin.password = newPassword;
            admin.isAdmin = true; // Ensure they have admin rights
        }

        await admin.save();

        console.log("🔐 Admin password synchronized in Database successfully.");
        res.json({ 
            success: true, 
            message: "Password reset successful! You can now log in with username 'admin'." 
        });

    } catch (err) {
        console.error("Reset Error:", err);
        res.status(500).json({ success: false, message: "Database error during reset." });
    }
});

module.exports = router;