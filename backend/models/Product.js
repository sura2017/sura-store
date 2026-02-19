const mongoose = require('mongoose');

/**
 * PRODUCT MODEL (Advanced Series Version)
 * This schema handles Brand Grouping, Multiple Models (Variants),
 * and Dynamic User Ratings.
 */
const productSchema = new mongoose.Schema({
    // 1. Basic Info
    name: { 
        type: String, 
        required: true 
    }, // e.g., "ThinkPad Series" or "iPhone 15 Series"
    
    brand: { 
        type: String, 
        required: true 
    }, // e.g., "Lenovo", "Apple", "TECNO"
    
    category: { 
        type: String, 
        required: true 
    }, // e.g., "Laptops", "Mobile Phones"
    
    about: { 
        type: String, 
        required: true 
    }, // Detailed description of the series/brand features

    // 2. Dynamic Rating Logic
    // 'rating' stores the calculated average (e.g., 4.2)
    rating: { 
        type: Number, 
        default: 0 
    },
    
    // 'numRatings' tracks how many people have clicked a star
    numRatings: { 
        type: Number, 
        default: 0 
    },
    
    // 'ratingSum' tracks the total stars given (e.g., 5 + 4 + 5 = 14)
    // This is used internally to calculate the new average: (ratingSum / numRatings)
    ratingSum: { 
        type: Number, 
        default: 0 
    },

    // 3. Sales & Availability
    // Incremented automatically by the Order API
    boughtLastMonth: { 
        type: Number, 
        default: 0 
    },
    
    // Global toggle to hide/disable the product if the whole series is gone
    isAvailable: { 
        type: Boolean, 
        default: true 
    },
    
    createdAt: { 
        type: Date, 
        default: Date.now 
    },

    // 4. Individual Models (Variants)
    // This allows one "Product" to contain multiple options (Colors, Specs, etc.)
    variants: [{
        optionName: { 
            type: String, 
            required: true 
        }, // e.g., "X1 Carbon Gen 11" or "Pro Max 256GB"
        
        price: { 
            type: Number, 
            required: true 
        },
        
        image: { 
            type: String, 
            required: true 
        },
        
        description: { 
            type: String 
        } // Specific specs for this model: "i7 CPU, 16GB RAM"
    }]
});

module.exports = mongoose.model('Product', productSchema);