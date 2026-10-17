const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("./events/taskListeners");
require("dotenv").config();

const app = express();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const contentType = require("./middleware/contentType");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(contentType);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// PUBLIC authentication endpoints
app.use("/auth", authRoutes);

// Protected task endpoints
app.use("/tasks", taskRoutes);

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
