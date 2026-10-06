const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: {
            values: ["low", "medium", "high"],
            message: "{VALUE} is not a valid priority (allowed: low, medium, high)"
        },
        default: "medium",
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;