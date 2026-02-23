const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// ==================== CLIENT ROUTES ====================

// Register client
app.post('/api/clients/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Check if email already exists
        const existing = await db.get('SELECT id FROM clients WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = Date.now().toString();
        
        await db.run(
            'INSERT INTO clients (id, email, password, name) VALUES (?, ?, ?, ?)',
            [id, email, hashedPassword, name]
        );
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login client
app.post('/api/clients/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const client = await db.get('SELECT * FROM clients WHERE email = ?', [email]);
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
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get client data
app.get('/api/clients/:id', async (req, res) => {
    try {
        const client = await db.get('SELECT id, email, name, created_at FROM clients WHERE id = ?', [req.params.id]);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        // Get children
        const children = await db.query('SELECT * FROM children WHERE client_id = ?', [req.params.id]);
        
        res.json({
            ...client,
            children: children
        });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== DAYCARE ROUTES ====================

// Register daycare
app.post('/api/daycares/register', async (req, res) => {
    try {
        const { email, password, name, location } = req.body;
        
        // Check if email already exists
        const existing = await db.get('SELECT id FROM daycares WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = Date.now().toString();
        
        await db.run(
            'INSERT INTO daycares (id, email, password, name, location) VALUES (?, ?, ?, ?, ?)',
            [id, email, hashedPassword, name, location]
        );
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login daycare
app.post('/api/daycares/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const daycare = await db.get('SELECT * FROM daycares WHERE email = ?', [email]);
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
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get daycare data
app.get('/api/daycares/:id', async (req, res) => {
    try {
        const daycare = await db.get('SELECT id, email, name, location, created_at FROM daycares WHERE id = ?', [req.params.id]);
        
        if (!daycare) {
            return res.status(404).json({ error: 'Daycare not found' });
        }
        
        // Get placements
        const placements = await db.query('SELECT * FROM placements WHERE daycare_id = ?', [req.params.id]);
        
        res.json({
            ...daycare,
            placements: placements
        });
    } catch (error) {
        console.error('Get daycare error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== WAITLIST ROUTES ====================

// Add child to waitlist
app.post('/api/waitlist', async (req, res) => {
    try {
        const { clientId, childName, age, location } = req.body;
        
        const childId = Date.now().toString();
        const dateAdded = new Date().toISOString();
        
        // Insert child into children table
        await db.run(
            'INSERT INTO children (id, client_id, name, age, location) VALUES (?, ?, ?, ?, ?)',
            [childId, clientId, childName, parseInt(age), location]
        );
        
        // Insert into waitlist
        await db.run(
            'INSERT INTO waitlist (id, client_id, child_id, child_name, age, location, date_added) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [childId, clientId, childId, childName, parseInt(age), location, dateAdded]
        );
        
        res.json({ success: true, childId });
    } catch (error) {
        console.error('Add to waitlist error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get waitlist
app.get('/api/waitlist', async (req, res) => {
    try {
        const waitlist = await db.query('SELECT * FROM waitlist ORDER BY date_added ASC');
        
        // Transform to match expected format
        const formatted = waitlist.map(entry => ({
            id: entry.id,
            clientId: entry.client_id,
            childName: entry.child_name,
            age: entry.age,
            location: entry.location,
            dateAdded: entry.date_added
        }));
        
        res.json(formatted);
    } catch (error) {
        console.error('Get waitlist error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get waitlist position
app.get('/api/waitlist/position/:childId', async (req, res) => {
    try {
        const waitlist = await db.query('SELECT id FROM waitlist ORDER BY date_added ASC');
        const position = waitlist.findIndex(w => w.id === req.params.childId) + 1;
        res.json({ position: position || null });
    } catch (error) {
        console.error('Get position error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PLACEMENT ROUTES ====================

// Add placement
app.post('/api/placements', async (req, res) => {
    try {
        const { daycareId, minAge, maxAge, count } = req.body;
        
        // Verify daycare exists
        const daycare = await db.get('SELECT name, location FROM daycares WHERE id = ?', [daycareId]);
        if (!daycare) {
            return res.status(404).json({ error: 'Daycare not found' });
        }
        
        const placementId = Date.now().toString();
        const dateAdded = new Date().toISOString();
        
        await db.run(
            'INSERT INTO placements (id, daycare_id, daycare_name, daycare_location, min_age, max_age, total_count, available_count, date_added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                placementId,
                daycareId,
                daycare.name,
                daycare.location,
                parseInt(minAge),
                parseInt(maxAge),
                parseInt(count),
                parseInt(count),
                dateAdded
            ]
        );
        
        res.json({ success: true, placementId });
    } catch (error) {
        console.error('Add placement error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get placements
app.get('/api/placements', async (req, res) => {
    try {
        const placements = await db.query('SELECT * FROM placements');
        
        // Transform to match expected format
        const formatted = placements.map(placement => ({
            id: placement.id,
            daycareId: placement.daycare_id,
            daycareName: placement.daycare_name,
            daycareLocation: placement.daycare_location,
            minAge: placement.min_age,
            maxAge: placement.max_age,
            totalCount: placement.total_count,
            availableCount: placement.available_count,
            dateAdded: placement.date_added
        }));
        
        res.json(formatted);
    } catch (error) {
        console.error('Get placements error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== OFFER ROUTES ====================

// Create offer
app.post('/api/offers', async (req, res) => {
    try {
        const { childId, daycareId, placementId } = req.body;
        
        // Get waitlist entry
        const waitlistEntry = await db.get('SELECT * FROM waitlist WHERE id = ?', [childId]);
        if (!waitlistEntry) {
            return res.status(404).json({ error: 'Child not found in waitlist' });
        }
        
        // Get placement
        const placement = await db.get('SELECT * FROM placements WHERE id = ?', [placementId]);
        if (!placement) {
            return res.status(404).json({ error: 'Placement not found' });
        }
        
        if (placement.available_count === 0) {
            return res.status(400).json({ error: 'No available placements' });
        }
        
        // Get daycare
        const daycare = await db.get('SELECT name, location FROM daycares WHERE id = ?', [daycareId]);
        if (!daycare) {
            return res.status(404).json({ error: 'Daycare not found' });
        }
        
        // Check if offer already exists
        const existingOffer = await db.get(
            'SELECT id FROM offers WHERE child_id = ? AND daycare_id = ? AND status = ?',
            [childId, daycareId, 'pending']
        );
        
        if (existingOffer) {
            return res.status(400).json({ error: 'Offer already exists' });
        }
        
        const offerId = Date.now().toString();
        const dateCreated = new Date().toISOString();
        
        await db.run(
            'INSERT INTO offers (id, child_id, child_name, child_age, child_location, daycare_id, daycare_name, daycare_location, placement_id, status, date_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                offerId,
                childId,
                waitlistEntry.child_name,
                waitlistEntry.age,
                waitlistEntry.location,
                daycareId,
                daycare.name,
                daycare.location,
                placementId,
                'pending',
                dateCreated
            ]
        );
        
        res.json({ success: true, offerId });
    } catch (error) {
        console.error('Create offer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get offers
app.get('/api/offers', async (req, res) => {
    try {
        const offers = await db.query('SELECT * FROM offers');
        
        // Transform to match expected format
        const formatted = offers.map(offer => ({
            id: offer.id,
            childId: offer.child_id,
            childName: offer.child_name,
            childAge: offer.child_age,
            childLocation: offer.child_location,
            daycareId: offer.daycare_id,
            daycareName: offer.daycare_name,
            daycareLocation: offer.daycare_location,
            placementId: offer.placement_id,
            status: offer.status,
            dateCreated: offer.date_created,
            dateResponded: offer.date_responded
        }));
        
        res.json(formatted);
    } catch (error) {
        console.error('Get offers error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update offer status (accept/decline)
app.patch('/api/offers/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        const offer = await db.get('SELECT * FROM offers WHERE id = ?', [req.params.id]);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        
        const dateResponded = new Date().toISOString();
        
        await db.run(
            'UPDATE offers SET status = ?, date_responded = ? WHERE id = ?',
            [status, dateResponded, req.params.id]
        );
        
        if (status === 'accepted') {
            // Remove from waitlist
            await db.run('DELETE FROM waitlist WHERE id = ?', [offer.child_id]);
            
            // Decrease available placements
            await db.run(
                'UPDATE placements SET available_count = available_count - 1 WHERE id = ?',
                [offer.placement_id]
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Update offer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ADMIN ROUTES ====================
// (Optional: Remove or add authentication in production!)

// Admin query endpoint - allows running SELECT queries via API
app.post('/api/admin/query', async (req, res) => {
    try {
        const { sql } = req.body;
        
        if (!sql || !sql.trim()) {
            return res.status(400).json({ error: 'SQL query is required' });
        }
        
        // Only allow SELECT and PRAGMA queries for safety
        const trimmedQuery = sql.trim().toUpperCase();
        const isSafe = trimmedQuery.startsWith('SELECT') || 
                      trimmedQuery.startsWith('PRAGMA') ||
                      trimmedQuery.startsWith('EXPLAIN');
        
        if (!isSafe) {
            return res.status(400).json({ 
                error: 'Only SELECT, PRAGMA, and EXPLAIN queries are allowed via this endpoint' 
            });
        }
        
        const results = await db.query(sql);
        res.json({ success: true, results, count: results.length });
    } catch (error) {
        console.error('Admin query error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get database statistics
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM clients) as total_clients,
                (SELECT COUNT(*) FROM daycares) as total_daycares,
                (SELECT COUNT(*) FROM waitlist) as waitlist_count,
                (SELECT COUNT(*) FROM placements) as total_placements,
                (SELECT COUNT(*) FROM offers WHERE status = 'pending') as pending_offers,
                (SELECT COUNT(*) FROM offers WHERE status = 'accepted') as accepted_offers
        `);
        
        res.json({ success: true, stats: stats[0] });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get local IP address
function getLocalIP() {
    const os = require('os');
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

// Start server
async function startServer() {
    try {
        // Initialize database
        await initDatabase();
        console.log('Database ready');
        
        const localIP = getLocalIP();
        app.listen(PORT, HOST, () => {
            console.log('='.repeat(60));
            console.log(`Server is running!`);
            console.log('='.repeat(60));
            console.log(`Local access:    http://localhost:${PORT}`);
            console.log(`Network access:  http://${localIP}:${PORT}`);
            console.log(`API endpoint:    http://${localIP}:${PORT}/api`);
            console.log('='.repeat(60));
            console.log(`\nTo access from other devices on your network:`);
            console.log(`Use: http://${localIP}:${PORT}`);
            console.log(`\nMake sure your firewall allows connections on port ${PORT}`);
            console.log('\nDatabase: SQLite (daycare.db)');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await db.close();
    process.exit(0);
});

startServer();
