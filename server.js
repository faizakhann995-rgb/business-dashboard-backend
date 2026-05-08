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

// Put
app.put("/clients/:id", async (req, res) =>{
  try{
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, {new :true});
    res.json(updatedClient);
  
  }
  catch(err){
    console.log("UPDATE ERROR:", err)
    res.status(500).json({
      error: err.message
    })
  }
})

// Delete
app.delete("/clients/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("DELETE REQUEST:", id);

    const existing = await Client.findById(id);

    console.log("FOUND CLIENT:", existing);

    if (!existing) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    await Client.findByIdAndDelete(id);

    console.log("DELETE SUCCESS");

    const updated = await Client.find();

    res.json(updated);

  } catch (err) {
    console.log("DELETE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})