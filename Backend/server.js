const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const govtRoutes = require("./routes/govtRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load environment variables
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(" MongoDB Connected"))
.catch((err) => console.error(" MongoDB Error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Disaster Relief API Running...");
});
// Auth routes
app.use("/api/auth", authRoutes);

// Report routes
app.use("/api/reports", reportRoutes);

// NGO routes

app.use("/api/ngos", ngoRoutes);

// Government routes
app.use("/api/govt", govtRoutes);

// User routes
app.use("/api/users", userRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
