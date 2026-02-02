const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Initialize data file
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        // File doesn't exist, create it with default structure
        const defaultData = {
            clients: [],
            daycares: [],
            waitlist: [],
            placements: [],
            offers: []
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    }
}

// Read data from file
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { clients: [], daycares: [], waitlist: [], placements: [], offers: [] };
    }
}

// Write data to file
async function writeData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// ==================== CLIENT ROUTES ====================

// Register client
app.post('/api/clients/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const data = await readData();
        
        if (data.clients.find(c => c.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newClient = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            name,
            children: []
        };
        
        data.clients.push(newClient);
        await writeData(data);
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login client
app.post('/api/clients/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await readData();
        
        const client = data.clients.find(c => c.email === email);
        if (!client) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const validPassword = await bcrypt.compare(password, client.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        res.json({
            success: true,
            user: {
                type: 'client',
                id: client.id,
                email: client.email,
                name: client.name
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get client data
app.get('/api/clients/:id', async (req, res) => {
    try {
        const data = await readData();
        const client = data.clients.find(c => c.id === req.params.id);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        // Don't send password
        const { password, ...clientData } = client;
        res.json(clientData);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== DAYCARE ROUTES ====================

// Register daycare
app.post('/api/daycares/register', async (req, res) => {
    try {
        const { email, password, name, location } = req.body;
        const data = await readData();
        
        if (data.daycares.find(d => d.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newDaycare = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            name,
            location,
            placements: []
        };
        
        data.daycares.push(newDaycare);
        await writeData(data);
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login daycare
app.post('/api/daycares/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await readData();
        
        const daycare = data.daycares.find(d => d.email === email);
        if (!daycare) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const validPassword = await bcrypt.compare(password, daycare.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        res.json({
            success: true,
            user: {
                type: 'daycare',
                id: daycare.id,
                email: daycare.email,
                name: daycare.name
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get daycare data
app.get('/api/daycares/:id', async (req, res) => {
    try {
        const data = await readData();
        const daycare = data.daycares.find(d => d.id === req.params.id);
        
        if (!daycare) {
            return res.status(404).json({ error: 'Daycare not found' });
        }
        
        // Don't send password
        const { password, ...daycareData } = daycare;
        res.json(daycareData);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== WAITLIST ROUTES ====================

// Add child to waitlist
app.post('/api/waitlist', async (req, res) => {
    try {
        const { clientId, childName, age, location } = req.body;
        const data = await readData();
        
        const childId = Date.now().toString();
        const newEntry = {
            id: childId,
            clientId,
            childName,
            age: parseInt(age),
            location,
            dateAdded: new Date().toISOString()
        };
        
        data.waitlist.push(newEntry);
        
        // Update client's children list
        const client = data.clients.find(c => c.id === clientId);
        if (client) {
            if (!client.children) client.children = [];
            client.children.push({
                id: childId,
                name: childName,
                age: parseInt(age),
                location
            });
        }
        
        await writeData(data);
        res.json({ success: true, childId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get waitlist
app.get('/api/waitlist', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.waitlist);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get waitlist position
app.get('/api/waitlist/position/:childId', async (req, res) => {
    try {
        const data = await readData();
        const sortedWaitlist = [...data.waitlist].sort((a, b) => 
            new Date(a.dateAdded) - new Date(b.dateAdded)
        );
        const position = sortedWaitlist.findIndex(w => w.id === req.params.childId) + 1;
        res.json({ position: position || null });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PLACEMENT ROUTES ====================

// Add placement
app.post('/api/placements', async (req, res) => {
    try {
        const { daycareId, minAge, maxAge, count } = req.body;
        const data = await readData();
        
        const daycare = data.daycares.find(d => d.id === daycareId);
        if (!daycare) {
            return res.status(404).json({ error: 'Daycare not found' });
        }
        
        const placementId = Date.now().toString();
        const newPlacement = {
            id: placementId,
            daycareId,
            daycareName: daycare.name,
            daycareLocation: daycare.location,
            minAge: parseInt(minAge),
            maxAge: parseInt(maxAge),
            totalCount: parseInt(count),
            availableCount: parseInt(count),
            dateAdded: new Date().toISOString()
        };
        
        data.placements.push(newPlacement);
        
        if (!daycare.placements) daycare.placements = [];
        daycare.placements.push(newPlacement);
        
        await writeData(data);
        res.json({ success: true, placementId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get placements
app.get('/api/placements', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.placements);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== OFFER ROUTES ====================

// Create offer
app.post('/api/offers', async (req, res) => {
    try {
        const { childId, daycareId, placementId } = req.body;
        const data = await readData();
        
        const client = data.waitlist.find(w => w.id === childId);
        const placement = data.placements.find(p => p.id === placementId);
        const daycare = data.daycares.find(d => d.id === daycareId);
        
        if (!client || !placement || !daycare) {
            return res.status(404).json({ error: 'Invalid data' });
        }
        
        if (placement.availableCount === 0) {
            return res.status(400).json({ error: 'No available placements' });
        }
        
        // Check if offer already exists
        const existingOffer = data.offers.find(o => 
            o.childId === childId && 
            o.daycareId === daycareId && 
            o.status === 'pending'
        );
        
        if (existingOffer) {
            return res.status(400).json({ error: 'Offer already exists' });
        }
        
        const offerId = Date.now().toString();
        const newOffer = {
            id: offerId,
            childId,
            childName: client.childName,
            childAge: client.age,
            childLocation: client.location,
            daycareId,
            daycareName: daycare.name,
            daycareLocation: daycare.location,
            placementId,
            status: 'pending',
            dateCreated: new Date().toISOString()
        };
        
        data.offers.push(newOffer);
        await writeData(data);
        
        res.json({ success: true, offerId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get offers
app.get('/api/offers', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.offers);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update offer status (accept/decline)
app.patch('/api/offers/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const data = await readData();
        
        const offer = data.offers.find(o => o.id === req.params.id);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        
        offer.status = status;
        offer.dateResponded = new Date().toISOString();
        
        if (status === 'accepted') {
            // Remove from waitlist
            const waitlistIndex = data.waitlist.findIndex(w => w.id === offer.childId);
            if (waitlistIndex !== -1) {
                data.waitlist.splice(waitlistIndex, 1);
            }
            
            // Decrease available placements
            const placement = data.placements.find(p => p.id === offer.placementId);
            if (placement) {
                placement.availableCount--;
            }
        }
        
        await writeData(data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
async function startServer() {
    await initDataFile();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
    });
}

startServer();
