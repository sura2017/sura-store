const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * 1. GET ALL PRODUCTS
 * Fetches all series and sorts by newest first.
 */
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products", error: err.message });
    }
});

/**
 * 2. POST - CREATE ADVANCED PRODUCT SERIES
 * Handles Brand, Category, Initial Rating, About, and Models (Variants).
 */
router.post('/', async (req, res) => {
    try {
        console.log("📥 Received New Product Data:", req.body.name);
        
        const product = new Product({
            name: req.body.name,
            brand: req.body.brand,
            category: req.body.category,
            about: req.body.about,
            rating: req.body.rating || 0,
            numRatings: req.body.numRatings || 0,
            ratingSum: (req.body.rating || 0) * (req.body.numRatings || 0), // Initialize sum for math
            boughtLastMonth: req.body.boughtLastMonth || 0,
            variants: req.body.variants, 
            isAvailable: true 
        });

        const savedProduct = await product.save();
        console.log("✅ Advanced Product Series Saved!");
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("❌ Save Error:", err.message);
        res.status(400).json({ message: "Failed to save product", error: err.message });
    }
});

/**
 * 3. PUT - DYNAMIC RATING SYSTEM (NEW)
 * This handles the math: New Average = Total Stars / Total People
 */
router.put('/:id/rate', async (req, res) => {
    try {
        const { starValue } = req.body; // Expects a number 1-5
        
        if (!starValue || starValue < 1 || starValue > 5) {
            return res.status(400).json({ message: "Invalid rating value. Must be 1-5." });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Update the running totals
        product.numRatings += 1;
        product.ratingSum += starValue;
        
        // Calculate new average and round to 1 decimal place
        product.rating = (product.ratingSum / product.numRatings).toFixed(1);

        await product.save();
        
        console.log(`⭐ New Rating for [${product.name}]: ${product.rating} (${product.numRatings} reviews)`);
        res.json({ success: true, newRating: product.rating, totalReviews: product.numRatings });
    } catch (err) {
        console.error("❌ Rating Error:", err.message);
        res.status(500).json({ message: "Failed to update rating", error: err.message });
    }
});

/**
 * 4. PUT - TOGGLE AVAILABILITY
 */
router.put('/:id/status', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isAvailable = !product.isAvailable;
        const updatedProduct = await product.save();
        
        console.log(`🔄 Status for [${product.name}] changed to: ${product.isAvailable ? 'Available' : 'Out of Stock'}`);
        res.json(updatedProduct);
    } catch (err) {
        console.error("❌ Toggle Error:", err.message);
        res.status(500).json({ message: "Failed to update status", error: err.message });
    }
});

/**
 * 5. DELETE PRODUCT
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        console.log(`🗑️ Product Deleted: ${deletedProduct.name}`);
        res.json({ message: "Product series deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
});

module.exports = router;