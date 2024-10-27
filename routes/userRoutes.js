const express = require("express");
const {
  registerController,
  loginController,
  updateController,
  forgetpasswordController,
  uploadAudioController,
  commentsController,
  deleteRecordingController,
} = require("../controllers/userController");
const Comment = require("../models/commentsModel");

//router object
const router = express.Router();

//register route
router.post("/register", registerController);

//login route
router.post("/login", loginController);

//update route
router.put("/update", updateController);

//forget password route
router.post("/forgetpassword", forgetpasswordController);

//upload audio route
router.post("/upload", uploadAudioController);

router.delete("/api/delete-audio/:filename", deleteRecordingController);

//submit comments
router.post("/comments", commentsController);

//export
module.exports = router;
