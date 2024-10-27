const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add your email"],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model("Comment", CommentSchema);
