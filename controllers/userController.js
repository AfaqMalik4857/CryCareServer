const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const sendResetEmail = require("../utils/sendResetEmail");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

//register
const registerController = async (req, res) => {
  try {
    const { name, gender, email, password } = req.body;
    //validation
    if (!name || !gender || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }
    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be greater than or equal to 6 characters!",
      });
    }

    //existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "This email is already Register",
      });
    }
    //hash password
    const hashedpassword = await hashPassword(password);

    //save user
    const user = await userModel({
      name,
      gender,
      email,
      password: hashedpassword,
    }).save();

    return res.status(201).send({
      success: true,
      message: "Register Successfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in register API",
      error,
    });
  }
};

//login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Email or Password",
      });
    }
    //find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(500).send({
        success: false,
        message: "User not found",
      });
    }
    //match password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(500).send({
        success: false,
        message: "Invalid username or password",
      });
    }
    //token jwt
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    //undefine password
    user.password = undefined;
    res.status(200).send({
      success: true,
      token,
      message: "Login Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Login API",
      error,
    });
  }
};

//update
const updateController = async (req, res) => {
  try {
    const { name, email, oldPassword, newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).send({
        success: false,
        message: "User not found or password not set",
      });
    }

    // Check for old password if provided
    if (oldPassword) {
      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).send({
          success: false,
          message: "Old password is incorrect",
        });
      }
    }

    // Validate new password if provided
    if (newPassword && newPassword.length < 6) {
      return res.status(400).send({
        success: false,
        message: "New password should be at least 6 characters long",
      });
    }

    // Hash the new password if provided, otherwise keep the current password
    const hashedNewPassword = newPassword
      ? await hashPassword(newPassword)
      : user.password;

    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      {
        name: name || user.name,
        password: hashedNewPassword,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(500).send({
        success: false,
        message: "Failed to update user",
      });
    }

    updatedUser.password = undefined; // Remove password from response

    res.status(200).send({
      success: true,
      message: "Profile Updated",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in update API",
      error: error.message || error,
    });
  }
};

const forgetpasswordController = async (req, res) => {
  const { email } = req.body;

  // Generate a random code
  async function generateCode(length) {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
  }

  try {
    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found with this email address.",
      });
    }

    // Generate a password reset token
    const token = await generateCode(10); // Adjust length for security
    user.resettoken = token;
    user.resettokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send the reset email
    await sendResetEmail(email, `Here is your Reset Token: ${token}`);
    return res.send({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
};

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /mp3|m4a|wav|mpeg/; // Add more audio formats as needed
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Audio files only!"));
  },
});
// Your existing user controller functions...

const uploadAudioController = async (req, res) => {
  console.log(req.file); // Check the uploaded file information

  if (!req.file) {
    return res.status(400).send({
      success: false,
      message: "No file uploaded.",
    });
  }

  const { email } = req.body; // Assuming you send the user email in the request body

  try {
    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    const audioFilePath = req.file.path; // Get the uploaded file path
    user.audioFiles.push(audioFilePath); // Save the file path to the user's record

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Audio uploaded successfully!",
      audioFilePath,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error uploading audio.",
      error: error.message || error,
    });
  }
};

//deleteRecording
const deleteRecordingController = async (req, res) => {
  const { filename } = req.params;

  try {
    // Assuming you have the user ID from the authenticated session or token
    const userId = req.user._id; // Modify as necessary based on your authentication method

    // Remove the filename from the user's audioFiles array in the database
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $pull: { audioFiles: filename } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Optionally delete the file from the file system
    const filePath = path.join(__dirname, "../uploads", filename); // Adjust the path based on your directory structure

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file from file system:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to delete audio file from file system.",
        });
      }

      // If file deletion is successful
      return res
        .status(200)
        .json({ success: true, message: "File deleted successfully." });
    });
  } catch (error) {
    console.error("Error deleting audio:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete audio." });
  }
};

//comments
const commentsController = async (req, res) => {
  const { name, email, comment } = req.body;

  try {
    const newComment = new Comment({ name, email, comment });
    await newComment.save();
    res.status(201).json({ message: "Comment submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving comment", error });
  }
};

module.exports = {
  registerController,
  loginController,
  updateController,
  forgetpasswordController,
  uploadAudioController,
  commentsController,
  deleteRecordingController,
};
