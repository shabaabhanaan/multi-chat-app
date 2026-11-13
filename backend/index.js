const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const chatSocket = require('./socket/chatSocket');

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Initialize Express & HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root & Health check
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'Multi-Chat App Server is running',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Socket logic
chatSocket(io);

// Error Handling Middleware
app.use(errorHandler);

// Connect Database and Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
