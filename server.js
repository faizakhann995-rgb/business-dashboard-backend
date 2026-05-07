import express from "express";
import cors from "cors";
import mongoose from "mongoose";
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://shopnosr:rushowsr@ac-thnjtsb-shard-00-00.zh9k44f.mongodb.net:27017,ac-thnjtsb-shard-00-01.zh9k44f.mongodb.net:27017,ac-thnjtsb-shard-00-02.zh9k44f.mongodb.net:27017/businessdb?ssl=true&replicaSet=atlas-yhgw3e-shard-0&authSource=admin"
)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const clientSchema = new mongoose.Schema({
    name : String,
    email : String,
    status : String
})

const Client = mongoose.model("Client", clientSchema);

// Get

app.get("/clients", async (req, res) =>{
    const data = await Client.find()
    res.json(data);
})

// Post 
app.post("/clients", async (req, res) =>{
    const newClient = new Client(req.body)
    await newClient.save();
    res.json(await Client.find());
})

// Delete
app.delete("/clients/:id", async (req, res) => {
  try {
    console.log("DELETE ID:", req.params.id);

    const deleted = await Client.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    const data = await Client.find();
    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})