const { sendResponse, AppError } = require("../helpers/utils.js");

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool 3.2 Challenge!");
});

const userRouter = require("./user.api.js");
const taskRouter = require("./task.api.js");
router.use("/users", userRouter);
router.use("/tasks", taskRouter);

module.exports = router;
