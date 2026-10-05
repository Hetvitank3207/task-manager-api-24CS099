const express = require("express");

const router = express.Router();

let tasks = [
    {
        id: 1,
        title: "Learn Node.js",
        completed: false
    }
];

router.get("/", (req, res) => {
    res.status(200).json({
        message: "Tasks fetched successfully",
        tasks: tasks
    });
});

router.post("/", (req, res) => {

    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: req.body.completed || false
    };

    tasks.push(newTask);

    res.status(201).json({
        message: "Task created successfully",
        task: newTask
    });
});

router.put("/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task Not Found"
        });
    }

    task.title = req.body.title;
    task.completed = req.body.completed;

    res.status(200).json({
        message: "Task updated successfully",
        task: task
    });
});

router.delete("/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task Not Found"
        });
    }

    tasks.splice(index, 1);

    res.status(200).json({
        message: "Task deleted successfully",
        tasks: tasks
    });
});

module.exports = router;