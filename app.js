const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const contentType = require("./middleware/contentType");
const taskRoutes = require("./routes/taskRoutes");

// MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(logger);

app.use(contentType);

// MONGODB CONNECTION
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

// ROUTES
app.use("/tasks", taskRoutes);

// 404 HANDLER
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});
// GLOBAL ERROR HANDLER
app.use(errorHandler);

// START SERVER
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});