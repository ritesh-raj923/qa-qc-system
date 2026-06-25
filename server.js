const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

const DATA_FILE = 'data.json';
const PORT = process.env.PORT || 3000;

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Read data
app.get('/api/data', (req, res) => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading data:', error);
        res.json([]);
    }
});

// Save data
app.post('/api/data', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get server status
app.get('/api/status', (req, res) => {
    const ip = getLocalIP();
    res.json({
        status: 'online',
        ip: ip,
        port: PORT,
        url: `http://${ip}:${PORT}`,
        records: fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).length : 0
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log('\n✅ QA/QC Server Started Successfully!');
    console.log('========================================');
    console.log(`📱 Local Access:    http://localhost:${PORT}`);
    console.log(`🌐 Network Access:  http://${ip}:${PORT}`);
    console.log('========================================');
    console.log('📋 Share the Network Access URL with your team');
    console.log('💾 Data saved to: data.json');
    console.log('\n🔄 Server is running... Press Ctrl+C to stop\n');
});