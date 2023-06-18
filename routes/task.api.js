const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTaskById,
} = require("../controllers/task.controller");

/**
 * @route POST api/tasks
 * @description Create a task
 */
router.post("/", createTask);

/**
 * @route GET api/tasks
 * @description Get a list of tasks
 */
router.get("/", getTasks);

/**
 * @route GET api/tasks/:taskId
 * @description Get task by id
 */
router.get("/:taskId", getTaskById);

/**
 * @route PUT api/tasks/:taskId
 * @description Update task by id
 */
router.put("/:taskId", updateTask);

/**
 * @route DELETE api/tasks/:taskId
 * @description Delete task by id
 */
router.delete("/:taskId", deleteTaskById);

module.exports = router;
