const express = require('express');
const path = require('path');
const Datastore = require('@seald-io/nedb');

const app = express();
const PORT = 3000;

// Initialize a lightweight embedded file-based database
const db = new Datastore({ filename: 'widgets.db', autoload: true });

// Middleware to parse incoming JSON payloads and serve your static frontend file
app.use(express.json());
app.use(express.static(__dirname));

// 1. THE SAVE ENDPOINT: Automatically receives the JSON configuration data schema from your studio
app.post('/api/widgets/save', (req, res) => {
    try {
        const { title, configData } = req.body;
        // Generate a clean 5-character alphanumeric share slug (e.g., "7f3k2")
        const uniqueId = Math.random().toString(36).substring(2, 7); 
        
        const document = { uniqueId, title, configData, createdAt: new Date() };
        
        db.insert(document, (err, newDoc) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, shareUrl: `/?id=${uniqueId}` });
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. THE LOAD ENDPOINT: Searches the database for the unique slug id requested by the frontend
app.get('/api/widgets/:id', (req, res) => {
    db.findOne({ uniqueId: req.params.id }, (err, doc) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!doc) return res.status(404).json({ error: "Widget profile not found" });
        res.json(doc);
    });
});

// Route catch-all to cleanly serve the main editor view
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `🚀 Success! Platform studio engine is live.`);
    console.log(`👉 Open your browser and navigate to: http://localhost:${PORT}\n`);
});