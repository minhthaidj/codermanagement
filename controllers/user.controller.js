const { sendResponse, AppError } = require("../helpers/utils.js");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/User.js");

const userController = {};

//Create User
userController.createUser = async (req, res, next) => {
  let info = req.body;

  try {
    if (!info) throw new AppError(400, "Missing information", "Bad Request");
    const created = await User.create(info);

    //Send response
    sendResponse(res, 200, true, { created }, null, "Create User Success");
  } catch (err) {
    next(err);
  }
};

//Get Users
userController.getUsers = async (req, res, next) => {
  const allowedFilter = ["name", "role"];
  const { ...filterQuery } = req.query;
  console.log("req.query", req.query);
  try {
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key))
        throw new AppError(400, `query ${key} is not allowed`, "Bad request");
    });

    //Get users
    const { name, role } = filterQuery;
    const listOfUsers = await User.find({
      name: !name ? { $exists: true } : name,
      role: !role ? { $exists: true } : role,
      // isDeleted: false,
    }).populate("tasks");

    //--Send Response
    sendResponse(
      res,
      200,
      true,
      listOfUsers,
      null,
      "Found list of users success"
    );
  } catch (err) {
    next(err);
  }
};

userController.getUserById = async (req, res, next) => {
  const { targetId } = req.params;
  try {
    if (!targetId) throw new AppError(400, "Missing user id", "Bad Request");
    //--Query
    const singleUser = await User.findById(targetId).populate("tasks");
    if (!singleUser) {
      sendResponse(
        res,
        404,
        false,
        null,
        "Not found",
        "Can't find user with this id"
      );
    } else if (singleUser.isDeleted === true) {
      throw new AppError(400, "User is deleted", "Bad request");
    }

    sendResponse(res, 200, true, { singleUser }, null, "Get one user success");
  } catch (err) {
    next(err);
  }
};

userController.updateUserById = async (req, res, next) => {
  const { targetId } = req.params;

  const { ...updateInfo } = req.body;
  const options = { new: true };

  const allowedUpdate = ["name", "role"];
  try {
    //check valid field
    if (!updateInfo || !targetId)
      throw new AppError(400, "No request body or no User id", "Bad Request");

    const foundUser = await User.findById(targetId);
    if (!foundUser) throw new AppError(404, "User does not exist", "Not Found");

    const updateFields = Object.keys(updateInfo);
    updateFields.forEach((field) => {
      if (!allowedUpdate.includes(field))
        throw new AppError(400, "Update with invalid field", "Bad request");
      if (!updateInfo[field]) delete updateInfo[field];
    });

    //--Query
    const updated = await User.findByIdAndUpdate(targetId, updateInfo, options);

    sendResponse(res, 200, true, { updated }, null, "Update user success");
  } catch (err) {
    next(err);
  }
};

userController.deleteUserById = async (req, res, next) => {
  const { targetId } = req.params;

  try {
    if (!targetId) throw new AppError(400, "No user id", "Bad Request");
    //--Query
    let targetUser = await User.findById(targetId);
    if (!targetUser) throw new AppError(404, "User not found", "Not found");

    const deletedUser = await User.findByIdAndUpdate(
      targetId,
      { isDeleted: true },
      { new: true }
    );
    sendResponse(res, 200, true, { deletedUser }, null, "Delete user success");
  } catch (err) {
    next(err);
  }
};

userController.getTasksByUserId = async (req, res, next) => {
  const { targetId } = req.params;

  try {
    if (!targetId) throw new AppError(400, "Missing user id", "Bad request");
    let userFound = await User.findById(targetId);
    if (!userFound) sendResponse(res, 404, false, null, null, "No user found");
    console.log("test", userFound);
    sendResponse(
      res,
      200,
      true,
      { tasks: userFound.tasks },
      null,
      "Found user's tasks"
    );
  } catch (error) {
    next(error);
  }
};

//export
module.exports = userController;
