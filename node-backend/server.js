const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectMongoDB = require("./config/mongo");
const {connectRedis} = require("./config/redisClient");

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    // origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible in routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for authenticated users
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room: ${userId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/upload", uploadRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Node + PostgreSQL Backend Running...");
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectMongoDB();
connectRedis(); 

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
