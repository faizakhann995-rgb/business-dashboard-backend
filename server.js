import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔥 MongoDB Connection
mongoose
  .connect(
    "mongodb://shopnosr:rushowsr@ac-thnjtsb-shard-00-00.zh9k44f.mongodb.net:27017,ac-thnjtsb-shard-00-01.zh9k44f.mongodb.net:27017,ac-thnjtsb-shard-00-02.zh9k44f.mongodb.net:27017/businessdb?ssl=true&replicaSet=atlas-yhgw3e-shard-0&authSource=admin"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// 📦 Schema
const clientSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    status: String,
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);

// ======================
// 🔥 GET ALL CLIENTS
// ======================
app.get("/clients", async (req, res) => {
  try {
    const data = await Client.find();
    res.json(data);
  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 🔥 CREATE CLIENT
// ======================
app.post("/clients", async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();

    const data = await Client.find();
    res.json(data);
  } catch (err) {
    console.log("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 🔥 UPDATE CLIENT
// ======================
app.put("/clients/:id", async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(updated);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 🔥 DELETE CLIENT
// ======================
app.delete("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("DELETE REQUEST:", id);

    const deleted = await Client.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }

    const data = await Client.find();
    res.json(data);

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 🔥 SERVER START
// ======================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});