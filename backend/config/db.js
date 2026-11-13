const mongoose = require('mongoose');
const dns = require('dns');

// Fix SRV DNS resolution on Windows / Node 20+
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
    console.warn('DNS server override not available, using default resolver.');
}

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/multi-chat';
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Do not crash server in dev so app can still provide diagnostics
        console.warn('Backend running without DB connection. Check your MONGO_URI.');
    }
};

module.exports = connectDB;
