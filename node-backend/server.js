const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectMongoDB = require("./config/mongo");
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("Node + PostgreSQL Backend Running...");
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
