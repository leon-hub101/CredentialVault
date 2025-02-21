const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const OU = require("./models/OU");
const Division = require("./models/Division");
const CredentialRepository = require("./models/CredentialRepository");
const {
  generateToken,
  hashPassword,
  comparePassword,
} = require("./utils/auth");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./utils/auth");

const mongoURI = "mongodb://localhost:27017/credentialvault";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authenticate middleware
const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token received:", token);

  if (!token) {
    console.log("No token provided");
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token decoded:", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log("User authenticated:", {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      divisions: user.divisions.map((id) => id.toString()),
    });
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        detailedError: error.message,
      });
    }
  }
};

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to the CredentialVault backend!");
});

// Registration endpoint
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || "user";
    const user = new User({
      username,
      password: hashedPassword,
      role: userRole,
      divisions: [],
    });
    await user.save();

    const token = generateToken(user._id);
    console.log("JWT Token generated:", token);
    res.status(201).json({ token, userId: user._id, role: user.role });
  } catch (jwtError) {
    console.error("Error generating JWT:", jwtError);
    res.status(500).json({ message: "Error generating token" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user._id);
    res.status(200).json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch division credentials
app.get(
  "/api/divisions/:divisionId/credentials",
  authenticate,
  async (req, res) => {
    try {
      const divisionId = req.params.divisionId;
      console.log("Fetching credentials for division:", divisionId);

      const division = await Division.findById(divisionId);
      console.log("Division:", division);
      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }

      console.log("req.user:", req.user);
      if (!req.user.divisions.some((id) => id.equals(divisionId))) {
        return res.status(403).json({
          message:
            "Access denied. You do not have permission to view this division.",
        });
      }

      const credentials = await CredentialRepository.find({
        division: divisionId,
      });
      console.log("Credentials:", credentials);
      res.status(200).json(credentials);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Add credential
app.post(
  "/api/divisions/:divisionId/credentials",
  authenticate,
  async (req, res) => {
    try {
      const divisionId = req.params.divisionId;
      const { name, username, password } = req.body;

      const division = await Division.findById(divisionId);
      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }

      console.log("req.user:", req.user);
      if (!req.user.divisions.some((id) => id.equals(divisionId))) {
        return res.status(403).json({
          message:
            "Access denied. No permission to add credentials to this division.",
        });
      }

      const hashedPassword = await hashPassword(password);
      const newCredential = new CredentialRepository({
        name,
        username,
        password: hashedPassword,
        division: divisionId,
      });
      await newCredential.save();
      division.credentials.push(newCredential._id);
      await division.save();

      res.status(201).json({
        message: "Credential added successfully",
        credential: newCredential,
      });
    } catch (error) {
      console.error("Error adding credential:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update credential
app.put(
  "/api/divisions/:divisionId/credentials/:credentialId",
  authenticate,
  async (req, res) => {
    try {
      const divisionId = req.params.divisionId;
      const credentialId = req.params.credentialId;
      const { name, username, password } = req.body;

      const division = await Division.findById(divisionId);
      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }

      const credential = await CredentialRepository.findById(credentialId);
      if (!credential || !credential.division.equals(divisionId)) {
        return res.status(404).json({
          message: "Credential not found or does not belong to this division",
        });
      }

      console.log("req.user:", req.user);
      if (
        !req.user.divisions.some((id) => id.equals(divisionId)) ||
        (req.user.role !== "admin" && req.user.role !== "management")
      ) {
        return res.status(403).json({
          message: "Access denied. Permission to update credentials required.",
        });
      }

      if (name) credential.name = name;
      if (username) credential.username = username;
      if (password) credential.password = await hashPassword(password);
      await credential.save();

      res
        .status(200)
        .json({ message: "Credential updated successfully", credential });
    } catch (error) {
      console.error("Error updating credential:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete credential
app.delete(
  "/api/divisions/:divisionId/credentials/:credentialId",
  authenticate,
  async (req, res) => {
    try {
      const divisionId = req.params.divisionId;
      const credentialId = req.params.credentialId;

      const division = await Division.findById(divisionId);
      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }

      const credential = await CredentialRepository.findById(credentialId);
      if (!credential || !credential.division.equals(divisionId)) {
        return res.status(404).json({
          message: "Credential not found or does not belong to this division",
        });
      }

      console.log("req.user:", req.user);
      if (
        !req.user.divisions.some((id) => id.equals(divisionId)) ||
        (req.user.role !== "admin" && req.user.role !== "management")
      ) {
        return res.status(403).json({
          message: "Access denied. Permission to delete credentials required.",
        });
      }

      division.credentials = division.credentials.filter(
        (id) => !id.equals(credentialId)
      );
      await division.save();
      await CredentialRepository.findByIdAndDelete(credentialId);

      res.status(200).json({ message: "Credential deleted successfully" });
    } catch (error) {
      console.error("Error deleting credential:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Fetch all users (admin-only)
app.get("/api/users", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can view users." });
    }
    const users = await User.find().populate("divisions");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch all divisions
app.get("/api/divisions", authenticate, async (req, res) => {
  try {
    const divisions = await Division.find().populate("ou");
    res.status(200).json(divisions);
  } catch (error) {
    console.error("Error fetching divisions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch all OUs
app.get("/api/ous", authenticate, async (req, res) => {
  try {
    const ous = await OU.find().populate("divisions");
    console.log("OUs sent to frontend:", ous);
    res.status(200).json(ous);
  } catch (error) {
    console.error("Error fetching OUs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assign user to division/OU
app.post("/api/admin/assign-user", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can assign users." });
    }

    const { userId, divisionId, ouId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (divisionId) {
      const division = await Division.findById(divisionId);
      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }
      if (!user.divisions.some((id) => id.equals(divisionId))) {
        user.divisions.push(divisionId);
      }
    }

    if (ouId) {
      const ou = await OU.findById(ouId);
      if (!ou) {
        return res.status(404).json({ message: "OU not found" });
      }
      const divisionsInOU = await Division.find({ ou: ouId });
      divisionsInOU.forEach((division) => {
        if (!user.divisions.some((id) => id.equals(division._id))) {
          user.divisions.push(division._id);
        }
      });
    }

    await user.save();
    res.status(200).json({ message: "User assigned successfully", user });
  } catch (error) {
    console.error("Error assigning user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Unassign user from division/OU
app.post("/api/admin/unassign-user", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can unassign users." });
    }

    const { userId, divisionId, ouId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let changed = false;
    if (divisionId) {
      const initialLength = user.divisions.length;
      user.divisions = user.divisions.filter((id) => !id.equals(divisionId));
      if (user.divisions.length < initialLength) changed = true;
    }

    if (ouId) {
      const divisionsInOU = await Division.find({ ou: ouId });
      const initialLength = user.divisions.length;
      user.divisions = user.divisions.filter(
        (id) => !divisionsInOU.some((d) => d._id.equals(id))
      );
      if (user.divisions.length < initialLength) changed = true;
    }

    if (changed) {
      await user.save();
      console.log("User after unassignment:", user);
      res.status(200).json({ message: "User unassigned successfully", user });
    } else {
      res.status(200).json({ message: "No changes made", user });
    }
  } catch (error) {
    console.error("Error unassigning user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Change user role
app.put("/api/admin/change-role/:userId", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can change roles." });
    }

    const { userId } = req.params;
    const { newRole } = req.body;

    if (!["user", "management", "admin"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Error changing user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch current user's details
app.get("/api/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("divisions");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
