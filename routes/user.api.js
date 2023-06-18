const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getTasksByUserId,
} = require("../controllers/user.controller");

/**
 * @route POST api/users
 * @description Create a new user
 */
router.post("/", createUser);

/**
 * @route GET api/users
 * @description Get a list of users
 */
router.get("/", getUsers);

/**
 * @route GET api/users/:targetId
 * @description Get user by id
 */
router.get("/:targetId", getUserById);

/**
 * @route PUT api/users/:targetId
 * @description Update user by id
 */
router.put("/:targetId", updateUserById);

/**
 * @route DELETE api/users/:targetId
 * @description Delete user by id
 */
router.delete("/:targetId", deleteUserById);

/**
 * @route GET api/users/:targetId/tasks
 * @description Get tasks of a user by user id
 */
router.get("/:targetId/tasks", getTasksByUserId);

module.exports = router;
