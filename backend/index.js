const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const chatSocket = require('./socket/chatSocket');

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

// Load config
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Root
app.get("/", (req, res) => {
    res.status(200).send("Multi-Chat App Server is running");
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Socket logic
chatSocket(io);

// Error middleware
app.use(errorHandler);

// Connect DB and Start Server
connectDB();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
