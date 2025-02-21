const mongoose = require("mongoose");
const User = require("./src/models/User");
const OU = require("./src/models/OU");
const Division = require("./src/models/Division");
const CredentialRepository = require("./src/models/CredentialRepository");
const { hashPassword } = require("./src/utils/auth");

const mongoURI = "mongodb://localhost:27017/credentialvault";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await OU.deleteMany({});
    await Division.deleteMany({});
    await CredentialRepository.deleteMany({});
    console.log("Existing data cleared");
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
};

// Add sample data
const seedData = async () => {
  try {
    // Create OUs
    console.log("Creating OUs...");
    const ou1 = await OU.create({ name: "News Management" });
    const ou2 = await OU.create({ name: "Software Reviews" });
    const ou3 = await OU.create({ name: "Hardware Reviews" });
    const ou4 = await OU.create({ name: "Opinion Publishing" });

    // Create Divisions
    console.log("Creating Divisions...");
    const division1 = await Division.create({ name: "Finance", ou: ou1._id });
    const division2 = await Division.create({ name: "IT", ou: ou2._id });
    const division3 = await Division.create({ name: "Writing", ou: ou3._id });
    const division4 = await Division.create({
      name: "Development",
      ou: ou4._id,
    });

    // Update OUs with their divisions
    console.log("Updating OUs with divisions...");
    ou1.divisions = [division1._id];
    ou2.divisions = [division2._id];
    ou3.divisions = [division3._id];
    ou4.divisions = [division4._id];
    await ou1.save();
    await ou2.save();
    await ou3.save();
    await ou4.save();
    console.log("OU News Management:", ou1);
    console.log("OU Software Reviews:", ou2);
    console.log("OU Hardware Reviews:", ou3);
    console.log("OU Opinion Publishing:", ou4);

    // Hash passwords before creating users
    console.log("Hashing passwords...");
    const hashedPassword1 = await hashPassword("password123");
    const hashedPassword2 = await hashPassword("adminpass");

    // Create Users with divisions
    console.log("Creating users...");
    const user1 = await User.create({
      username: "user1",
      password: hashedPassword1,
      role: "user",
      divisions: [division1._id],
    });

    const admin1 = await User.create({
      username: "admin1",
      password: hashedPassword2,
      role: "admin",
      divisions: [division1._id, division2._id, division3._id, division4._id],
    });
    console.log("User1 divisions:", user1.divisions);
    console.log("Admin1 divisions:", admin1.divisions);

    // Create Credentials
    console.log("Creating credentials...");
    await CredentialRepository.create({
      name: "Finance Server Login",
      username: "financeAdmin",
      password: await hashPassword("finance123"),
      division: division1._id,
    });

    await CredentialRepository.create({
      name: "IT SSH Access",
      username: "itOps",
      password: await hashPassword("itops456"),
      division: division2._id,
    });

    await CredentialRepository.create({
      name: "Writing WordPress",
      username: "writer",
      password: await hashPassword("write789"),
      division: division3._id,
    });

    await CredentialRepository.create({
      name: "Development Git",
      username: "devOps",
      password: await hashPassword("dev000"),
      division: division4._id,
    });

    console.log("Sample data added successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};

// Run the script
const run = async () => {
  try {
    await clearData();
    await seedData();
    console.log("Seeding completed");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

run();
