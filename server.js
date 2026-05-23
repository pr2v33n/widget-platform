const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000; // Uses the cloud provider's port automatically in production

// Middleware to parse incoming JSON payloads and serve your static frontend file
app.use(express.json());
app.use(express.static(__dirname));

// ─── MONGOOSE DATABASE CONNECTION ───
// We use process.env.MONGO_URI so your secret password stays hidden and safe in the cloud settings
const mongoURI = process.env.MONGO_URI || "mongodb+srv://pr2v33n:2019@0086@cluster0.b8cfob4.mongodb.net/studio-platform?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log('📁 Linked successfully to Cloud MongoDB Atlas!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define the blueprint structure for database items
const WidgetSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    configData: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Widget = mongoose.model('Widget', WidgetSchema);
// ─── END DATABASE SETUP ───


// 1. THE SAVE ENDPOINT: Receives the JSON layout data from your studio front-end
app.post('/api/widgets/save', async (req, res) => {
    try {
        const { title, configData } = req.body;
        // Generate a clean 5-character alphanumeric share slug
        const uniqueId = Math.random().toString(36).substring(2, 7); 
        
        const newWidget = new Widget({ uniqueId, title, configData });
        await newWidget.save();
        
        res.json({ success: true, shareUrl: `/?id=${uniqueId}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. THE LOAD ENDPOINT: Searches MongoDB for the unique slug id requested by the frontend
app.get('/api/widgets/:id', async (req, res) => {
    try {
        const doc = await Widget.findOne({ uniqueId: req.params.id });
        if (!doc) return res.status(404).json({ error: "Widget profile not found" });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route catch-all to cleanly serve the main editor view
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Production platform server background service online on port ${PORT}`);
});
