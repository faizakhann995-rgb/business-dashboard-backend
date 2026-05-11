import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 JWT Secret (better: env use করো later)
const JWT_SECRET = "mysecretkey";

// ======================
// 🔥 MIDDLEWARE
// ======================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// ======================
// 🔥 MONGODB CONNECTION
// ======================
mongoose
  .connect("mongodb://shopnosr:rushowsr@ac-thnjtsb-shard-00-00.zh9k44f.mongodb.net:27017,ac-thnjtsb-shard-00-01.zh9k44f.mongodb.net:27017,ac-thnjtsb-shard-00-02.zh9k44f.mongodb.net:27017/businessdb?ssl=true&replicaSet=atlas-yhgw3e-shard-0&authSource=admin")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err.message));

// ======================
// 🔥 SCHEMAS
// ======================

// USER
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// CLIENT
const clientSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    status: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const Client = mongoose.model("Client", clientSchema);

// ======================
// 🔐 AUTH ROUTES
// ======================

// REGISTER
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 🔐 AUTH MIDDLEWARE
// ======================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ======================
// 📦 CLIENT ROUTES (PROTECTED)
// ======================

// GET ALL CLIENTS
app.get("/clients", verifyToken, async (req, res) => {
  try {
    const data = await Client.find({
      userId: req.user.id,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE CLIENT
app.post("/clients", verifyToken, async (req, res) => {
  try {
    const newClient = new Client({
      ...req.body,
      userId: req.user.id,
    });

    await newClient.save();

    const data = await Client.find({
      userId: req.user.id,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE CLIENT
app.put("/clients/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Client.findOneAndUpdate(
  {
    _id: req.params.id,
    userId: req.user.id,
  },
  req.body,
  { new: true }
);

    if (!updated) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE CLIENT
app.delete("/clients/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Client not found" });
    }

    const data = await Client.find({
      userId: req.user.id,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 🚀 SERVER START
// ======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});