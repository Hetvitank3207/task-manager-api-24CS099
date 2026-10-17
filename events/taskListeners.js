const taskEvents = require("./taskEvents");

taskEvents.on("task-created", (task) => {
  setTimeout(() => {
    try {
      console.log(
        `[Notification] Task "${task.title}" created at ${new Date().toISOString()}, assigned user: ${task.owner}`
      );
    } catch (error) {
      taskEvents.emit("task-notification-error", error);
    }
  }, 2000);
});

taskEvents.on("task-deleted", (task) => {
  console.log(
    `[Notification] Task "${task.title}" deleted at ${new Date().toISOString()}, owner: ${task.owner}`
  );
});

taskEvents.on("task-notification-error", (error) => {
  console.error("[Notification Error]", error.message);
});