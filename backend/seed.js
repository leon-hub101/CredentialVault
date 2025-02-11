const mongoose = require('mongoose');
const User = require('./src/models/User');
const OU = require('./src/models/OU');
const Division = require('./src/models/Division');
const CredentialRepository = require('./src/models/CredentialRepository');

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/credentialvault'; // For local MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Clear existing data
const clearData = async () => {
  await User.deleteMany({});
  await OU.deleteMany({});
  await Division.deleteMany({});
  await CredentialRepository.deleteMany({});
  console.log('Existing data cleared');
};

// Add sample data
const seedData = async () => {
  // Create OUs
  const ou1 = await OU.create({ name: 'News Management' });
  const ou2 = await OU.create({ name: 'Software Reviews' });
  const ou3 = await OU.create({ name: 'Hardware Reviews' });
  const ou4 = await OU.create({ name: 'Opinion Publishing' });

  // Create Divisions
  const division1 = await Division.create({ name: 'Finance', ou: ou1._id });
  const division2 = await Division.create({ name: 'IT', ou: ou2._id });
  const division3 = await Division.create({ name: 'Writing', ou: ou3._id });
  const division4 = await Division.create({ name: 'Development', ou: ou4._id });

  // Create Credentials
  const credential1 = await CredentialRepository.create({
    name: 'WordPress Admin',
    username: 'admin',
    password: 'password123',
    division: division1._id,
  });
  const credential2 = await CredentialRepository.create({
    name: 'Server SSH',
    username: 'root',
    password: 'rootpass',
    division: division2._id,
  });

  // Create Users
  const user1 = await User.create({
    username: 'user1',
    password: 'password123',
    role: 'user',
    divisions: [division1._id],
  });
  const user2 = await User.create({
    username: 'admin1',
    password: 'adminpass',
    role: 'admin',
    divisions: [division2._id],
  });

  console.log('Sample data added');
};

// Run the script
const run = async () => {
  await clearData();
  await seedData();
  mongoose.connection.close();
};

run();