const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const cache = require("../utils/cache");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");
const validateTask = require("../middleware/validateTask");
const taskEvents = require("../events/taskEvents");

// Protect every task endpoint
router.use(authMiddleware);

// Cache keys scoped to each authenticated user
const allTasksKey = (userId) => `tasks:${userId}:all`;

const singleTaskKey = (userId, taskId) =>
  `tasks:${userId}:${taskId}`;

// Invalidate task caches after successful writes
const invalidateUserTaskCache = (userId, taskId = null) => {
  cache.del(allTasksKey(userId));

  if (taskId) {
    cache.del(singleTaskKey(userId, taskId));
  }
};

// GET /tasks — retrieve all tasks belonging to the logged-in user
router.get("/", async (req, res, next) => {
  try {
    const userId = String(req.user.id);
    const key = allTasksKey(userId);

    const cachedTasks = cache.get(key);

    if (cachedTasks !== undefined) {
      return res.status(200).json(cachedTasks);
    }

    const tasks = await Task.find({ owner: userId });

    cache.set(key, tasks);

    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /tasks/debug/cache — view in-memory cache statistics
router.get("/debug/cache", (req, res) => {
  return res.status(200).json({
    message: "In-memory cache statistics",
    stats: cache.getStats(),
    keys: cache.keys()
  });
});

// GET /tasks/:id — retrieve one task belonging to the logged-in user
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID."
      });
    }

    const userId = String(req.user.id);
    const taskId = req.params.id;
    const key = singleTaskKey(userId, taskId);

    const cachedTask = cache.get(key);

    if (cachedTask !== undefined) {
      return res.status(200).json(cachedTask);
    }

    const task = await Task.findOne({
      _id: taskId,
      owner: userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found."
      });
    }

    cache.set(key, task);

    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// POST /tasks — create a task and emit a background notification
router.post("/", validateTask, async (req, res, next) => {
  try {
    const userId = String(req.user.id);

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed,
      priority: req.body.priority,
      owner: userId
    });

    // Practical 9: invalidate cached task lists
    invalidateUserTaskCache(userId);

    console.log(
      `[API] Sending response at ${new Date().toISOString()}`
    );

    // Send the response before scheduling the notification
    res.status(201).json({
      message: "Task created successfully.",
      task
    });

    // Practical 10: defer event emission until after the response
    setImmediate(() => {
      taskEvents.emit("task-created", {
        title: task.title,
        owner: userId,
        taskId: String(task._id)
      });
    });
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id — update a task
router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID."
      });
    }

    const userId = String(req.user.id);
    const taskId = req.params.id;

    const allowedFields = [
      "title",
      "description",
      "completed",
      "priority"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one valid task field."
      });
    }

    if (Object.prototype.hasOwnProperty.call(updates, "title")) {
      if (
        typeof updates.title !== "string" ||
        !updates.title.trim() ||
        updates.title.trim().length > 200
      ) {
        return res.status(400).json({
          message: "Title must contain 1–200 characters."
        });
      }

      updates.title = updates.title.trim();
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        owner: userId
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found."
      });
    }

    // Invalidate list and individual task caches
    invalidateUserTaskCache(userId, taskId);

    return res.status(200).json({
      message: "Task updated successfully.",
      task
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id — delete a task and emit a notification
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID."
      });
    }

    const userId = String(req.user.id);
    const taskId = req.params.id;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      owner: userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found."
      });
    }

    // Practical 9: invalidate cached data
    invalidateUserTaskCache(userId, taskId);

    console.log(
      `[API] Delete response sent at ${new Date().toISOString()}`
    );

    // Respond to the client first
    res.status(200).json({
      message: "Task deleted successfully."
    });

    // Practical 10: schedule deletion notification
    setImmediate(() => {
      taskEvents.emit("task-deleted", {
        title: task.title,
        owner: userId,
        taskId: String(task._id)
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
