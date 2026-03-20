const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { testConnection } = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", require("./routes/index"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start server
async function start() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error("❌ Could not connect to database. Please run: npm run migrate first.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 DApp Voting Backend running on http://localhost:${PORT}`);
    console.log(`📊 API Base: http://localhost:${PORT}/api`);
    console.log(`💊 Health: http://localhost:${PORT}/health\n`);
  });
}

start();
