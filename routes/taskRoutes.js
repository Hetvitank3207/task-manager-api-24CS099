const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// GET /tasks - Fetch all tasks
router.get("/", async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
});

// GET /tasks/:id - Fetch single task by ID
router.get("/:id", async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
});

// POST /tasks - Create a new task
router.post("/", async (req, res, next) => {
    try {
        const body = req.body || {};
        const task = new Task(body);

        const savedTask = await task.save();

        res.status(201).json(savedTask);
    } catch (error) {
        next(error);
    }
});

// PUT /tasks/:id - Update a task by ID
router.put("/:id", async (req, res, next) => {
    try {
        const body = req.body || {};
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
});

// DELETE /tasks/:id - Delete a task by ID
router.delete("/:id", async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;