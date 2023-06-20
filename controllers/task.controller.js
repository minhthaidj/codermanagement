const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task");
const User = require("../models/User.js");
const ObjectId = require("mongoose").Types.ObjectId;

const taskController = {};

taskController.createTask = async (req, res, next) => {
  const info = req.body;
  const allowedFields = [
    "name",
    "description",
    "assignee",
    "status",
    "isDeleted",
  ];
  try {
    if (!info || !info.name || !info.description)
      throw new AppError(400, "Missing information", "Bad request");

    const taskFields = Object.keys(info);
    taskFields.forEach((field) => {
      if (!allowedFields.includes(field)) {
        throw new AppError(400, "Invalid task field", "Bad request");
      }
    });

    const duplicateTask = await Task.findOne({ name: info.name });
    if (duplicateTask) {
      throw new AppError(400, "Duplicate task", "Task already exists");
    }
    //--Query

    if (info.assignee) {
      // assign user if there is an assignee in body
      let assignedUser = await User.findById(info.assignee[0].assignee);
      console.log("info.assignee.assignee", info.assignee[0].assignee);
      if (!assignedUser)
        throw new AppError(400, "Bad Request", "Cannot find user");
      newTask = await Task.create(info).then(async (newTask) => {
        try {
          assignedUser.tasks.push({ task: newTask._id });
          assignedUser = await assignedUser.save();
        } catch (error) {
          next(error);
        }
      });
    } else newTask = await Task.create(info);

    sendResponse(
      res,
      200,
      true,
      { data: newTask },
      null,
      "Create task success"
    );
  } catch (error) {
    next(error);
  }
};

taskController.getTasks = async (req, res, next) => {
  const allowedFilter = ["name", "description", "assignee", "status"];
  const { ...filterQuery } = req.query;

  try {
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key))
        throw new AppError(400, `query ${key} is not allowed`, "Bad request");
    });

    //--Query
    const { name, description, assignee, status } = filterQuery;
    let listOfTasks = [];
    if (assignee && !status) {
      listOfTasks = await Task.find({
        name: !name ? { $exists: true } : name,
        description: !description ? { $exists: true } : description,
        assignee: assignee,
        isDeleted: false,
      }).populate("assignee.assignee");
    } else if (!assignee && status) {
      listOfTasks = await Task.find({
        name: !name ? { $exists: true } : name,
        description: !description ? { $exists: true } : description,
        status: status,
        isDeleted: false,
      }).populate("assignee.assignee");
    } else if (assignee && status) {
      listOfTasks = await Task.find({
        name: !name ? { $exists: true } : name,
        description: !description ? { $exists: true } : description,
        assignee: assignee,
        status: status,
        isDeleted: false,
      }).populate("assignee.assignee");
    } else if (!assignee && !status) {
      listOfTasks = await Task.find({
        name: !name ? { $exists: true } : name,
        description: !description ? { $exists: true } : description,
        isDeleted: false,
      }).populate("assignee.assignee");
    }

    console.log(listOfTasks, "listOfTasks");
    //--Send Response
    sendResponse(
      res,
      200,
      true,
      listOfTasks,
      null,
      "found list of tasks success"
    );
  } catch (error) {
    next(error);
  }
};

taskController.getTaskById = async (req, res, next) => {
  let { taskId } = req.params;
  try {
    //--Query
    const taskById = await Task.findById(taskId).populate("assignee.assignee");
    if (taskById.isDeleted === true) {
      throw new AppError(400, "Task is deleted", "Bad request");
    } else {
      sendResponse(
        res,
        200,
        true,
        { taskById },
        null,
        "Get task by id success"
      );
    }
  } catch (error) {
    next(error);
  }
};

taskController.updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const updateInfo = req.body;
  const allowedUpdate = ["name", "description", "assignee", "status"];

  try {
    //check param
    ObjectId.isValid(taskId);
    //check body inputs
    if (!updateInfo || !taskId)
      throw new AppError(400, "Missing update info", "Bad request");

    const updateFields = Object.keys(updateInfo);
    updateFields.forEach((field) => {
      if (!allowedUpdate.includes(field)) {
        throw new AppError(400, "Invalid update field!", "Bad request");
      }
    });
    //--Chưa verify các input để update
    //--Query
    const targetTask = await Task.findById(taskId);
    if (!targetTask) throw new AppError(404, "Task not found", "Bad Request");

    //status done to archive
    const { status } = targetTask;
    switch (status) {
      case "done":
        if (updateInfo.status !== "archive") {
          throw new AppError(
            400,
            "Done task can only be stored as archive",
            "Bad request"
          );
        }
        break;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateInfo, {
      new: true,
    }).populate("assignee.assignee");

    sendResponse(res, 200, true, { updatedTask }, null, "update task success");
  } catch (error) {
    next(error);
  }
};

taskController.deleteTaskById = async (req, res, next) => {
  const { taskId } = req.params;

  try {
    if (!taskId) throw new AppError(400, "No task id", "Bad Request");

    //--Query
    let targetTask = await Task.findById(taskId);
    if (!targetTask) throw new AppError(404, "Task not found", "Not found");

    const deletedTask = await Task.findByIdAndUpdate(
      taskId,
      { isDeleted: true },
      { new: true }
    );
    sendResponse(res, 200, true, { deletedTask }, null, "Delete task success");
  } catch (err) {
    next(err);
  }
};
//export
module.exports = taskController;
