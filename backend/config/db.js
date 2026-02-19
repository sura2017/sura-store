const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Set connection options to handle network drops better
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });

        console.log(`-------------------------------------------`);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}`);
        console.log(`-------------------------------------------`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log("Tip: Check your internet or MongoDB Atlas IP Whitelist.");
        // Don't kill the process immediately so you can see the error message
    }
};

module.exports = connectDB;