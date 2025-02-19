const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const {
  generateToken,
  hashPassword,
  comparePassword,
} = require("./utils/auth");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./utils/auth");
const Division = require("./models/Division");
const CredentialRepository = require("./models/CredentialRepository");
const mongoURI = "mongodb://localhost:27017/credentialvault";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to verify JWT and check user permissions
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      console.error("JWT Verification Error:", error);
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

// Registration endpoint
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Determine the user's role
    const userRole = role || "user";

    // Create a new user
    const user = new User({
      username,
      password: hashedPassword,
      role: userRole,
      divisions: [],
    });

    // Save the user to the database
    await user.save();

    // Generate a JWT token
    const token = generateToken(user._id);

    // Send the token and user details in the response
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
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = generateToken(user._id);

    // Send the token and user details in the response
    res.status(200).json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to fetch a division's credential repository
app.get(
  "/api/divisions/:divisionId/credentials",
  authenticate,
  async (req, res) => {
    try {
      const divisionId = req.params.divisionId;
      console.log("Fetching credentials for division:", divisionId);

      // Check if the division exists
      const division = await Division.findById(divisionId);
      console.log("Division:", division);
      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }

      // Check if the user has access to the division
      const user = await User.findById(req.user.userId);
      console.log("User divisions:", user.divisions);
      if (!user.divisions.includes(divisionId)) {
        return res.status(403).json({
          message:
            "Access denied. You do not have permission to view this division.",
        });
      }

      // Fetch the credentials for the division
      const credentials = await CredentialRepository.find({
        division: divisionId,
      });
      console.log("Credentials:", credentials);

      // Return the credentials
      res.status(200).json(credentials);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
