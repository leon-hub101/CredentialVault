const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "management", "admin"], 
    default: "user", 
  },
  divisions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division", 
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
