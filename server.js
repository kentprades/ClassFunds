const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, status: 'healthy' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/class', (req, res) => {
  res.sendFile(path.join(__dirname, 'class.html'));
});

app.get('/class.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'class.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.warn('⚠️ MONGO_URI is not set. Starting without MongoDB connection. Set it in Render environment variables.');
} else {
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000
  })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));
}

const recordSchema = new mongoose.Schema({
  funds: Number,
  dateIn: String,
  dateOut: String,
  desc: String,
  edited: Boolean,
  editDate: String
});

const Record = mongoose.model('Record', recordSchema);

app.get('/records', async (req, res) => {
  if (!mongoUri) {
    return res.status(503).json({ message: 'Database not configured yet.' });
  }

  try {
    const records = await Record.find();
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Failed to fetch records' });
  }
});

app.post('/records', async (req, res) => {
  if (!mongoUri) {
    return res.status(503).json({ message: 'Database not configured yet.' });
  }

  try {
    const newRecord = new Record(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ message: 'Failed to create record' });
  }
});

app.put('/records/:id', async (req, res) => {
  if (!mongoUri) {
    return res.status(503).json({ message: 'Database not configured yet.' });
  }

  try {
    const updated = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ message: 'Failed to update record' });
  }
});

app.delete('/records/:id', async (req, res) => {
  if (!mongoUri) {
    return res.status(503).json({ message: 'Database not configured yet.' });
  }

  try {
    const { passKey } = req.body;
    if (passKey === 'd3l3t3K3y') {
      const deleted = await Record.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.json({ message: 'Record deleted successfully' });
    } else {
      res.status(403).json({ message: 'Incorrect pass key' });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ message: 'Failed to delete record' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
