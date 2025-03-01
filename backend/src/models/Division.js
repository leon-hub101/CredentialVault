const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  ou: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OU", 
  },
  credentials: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CredentialRepository", 
    },
  ],
});

const Division = mongoose.model("Division", divisionSchema);

module.exports = Division;
