const mongoose = require("mongoose");

const ouSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  divisions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division", // Reference to the Division model
    },
  ],
});

const OU = mongoose.model("OU", ouSchema);

module.exports = OU;
