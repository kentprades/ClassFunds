const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection error:", err));

// 📦 Define schema
const recordSchema = new mongoose.Schema({
  funds: Number,
  dateIn: String,
  dateOut: String,
  desc: String,
  edited: Boolean,
  editDate: String
});

const Record = mongoose.model('Record', recordSchema);

// 📂 Routes
app.get('/records', async (req, res) => {
  const records = await Record.find();
  res.json(records);
});

app.post('/records', async (req, res) => {
  const newRecord = new Record(req.body);
  await newRecord.save();
  res.json(newRecord);
});

app.put('/records/:id', async (req, res) => {
  const updated = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/records/:id', async (req, res) => {
  const { passKey } = req.body;
  if (passKey === "d3l3t3K3y") {
    await Record.findByIdAndDelete(req.params.id);
    res.json({ message: "Record deleted successfully" });
  } else {
    res.status(403).json({ message: "Incorrect pass key" });
  }
});

// 🚀 Start server (Render provides PORT automatically)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
