const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division', 
  },
});

const CredentialRepository = mongoose.model('CredentialRepository', credentialSchema);

module.exports = CredentialRepository;