// Example: How to update script.js to use API instead of localStorage
// This shows the key functions updated to use the server API

const API_BASE_URL = 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== UPDATED AUTHENTICATION FUNCTIONS ====================

// BEFORE (localStorage):
/*
function registerClient(email, password, name) {
    const clients = getStorage(STORAGE_KEYS.CLIENTS);
    if (clients.find(c => c.email === email)) {
        showError('Email already registered');
        return false;
    }
    const newClient = { id: Date.now().toString(), email, password, name, children: [] };
    clients.push(newClient);
    setStorage(STORAGE_KEYS.CLIENTS, clients);
    showSuccess('Registration successful! Please login.');
    return true;
}
*/

// AFTER (API):
async function registerClient(email, password, name) {
    try {
        const result = await apiCall('/clients/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
        
        if (result.success) {
            showSuccess('Registration successful! Please login.');
            return true;
        }
    } catch (error) {
        showError(error.message);
        return false;
    }
}

// BEFORE (localStorage):
/*
function loginClient(email, password) {
    const clients = getStorage(STORAGE_KEYS.CLIENTS);
    const client = clients.find(c => c.email === email && c.password === password);
    if (!client) {
        showError('Invalid email or password');
        return false;
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
        type: 'client',
        id: client.id,
        email: client.email,
        name: client.name
    }));
    loadClientDashboard();
    showPage('clientDashboard');
    return true;
}
*/

// AFTER (API):
async function loginClient(email, password) {
    try {
        const result = await apiCall('/clients/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (result.success && result.user) {
            // Store user in localStorage for session management
            localStorage.setItem('daycare_current_user', JSON.stringify(result.user));
            await loadClientDashboard();
            showPage('clientDashboard');
            return true;
        }
    } catch (error) {
        showError(error.message);
        return false;
    }
}

// ==================== UPDATED WAITLIST FUNCTIONS ====================

// BEFORE (localStorage):
/*
function addChildToWaitlist(childName, age, location) {
    const user = getCurrentUser();
    const waitlist = getStorage(STORAGE_KEYS.WAITLIST);
    const clients = getStorage(STORAGE_KEYS.CLIENTS);
    // ... localStorage logic
}
*/

// AFTER (API):
async function addChildToWaitlist(childName, age, location) {
    const user = getCurrentUser();
    if (!user || user.type !== 'client') return;
    
    try {
        const result = await apiCall('/waitlist', {
            method: 'POST',
            body: JSON.stringify({
                clientId: user.id,
                childName,
                age: parseInt(age),
                location
            })
        });
        
        if (result.success) {
            showSuccess(`${childName} added to waitlist!`);
            await loadClientDashboard();
        }
    } catch (error) {
        showError(error.message);
    }
}

// BEFORE (localStorage):
/*
function getWaitlistPosition(childId) {
    const waitlist = getStorage(STORAGE_KEYS.WAITLIST);
    // ... localStorage logic
}
*/

// AFTER (API):
async function getWaitlistPosition(childId) {
    try {
        const result = await apiCall(`/waitlist/position/${childId}`);
        return result.position;
    } catch (error) {
        console.error('Error getting position:', error);
        return null;
    }
}

// ==================== UPDATED PLACEMENT FUNCTIONS ====================

// BEFORE (localStorage):
/*
function addPlacement(minAge, maxAge, count) {
    const user = getCurrentUser();
    const placements = getStorage(STORAGE_KEYS.PLACEMENTS);
    // ... localStorage logic
}
*/

// AFTER (API):
async function addPlacement(minAge, maxAge, count) {
    const user = getCurrentUser();
    if (!user || user.type !== 'daycare') return;
    
    try {
        const result = await apiCall('/placements', {
            method: 'POST',
            body: JSON.stringify({
                daycareId: user.id,
                minAge: parseInt(minAge),
                maxAge: parseInt(maxAge),
                count: parseInt(count)
            })
        });
        
        if (result.success) {
            showSuccess(`Added ${count} placement(s) for ages ${minAge}-${maxAge}`);
            await loadDaycareDashboard();
        }
    } catch (error) {
        showError(error.message);
    }
}

// ==================== UPDATED OFFER FUNCTIONS ====================

// BEFORE (localStorage):
/*
function offerPlacement(childId, placementId) {
    const waitlist = getStorage(STORAGE_KEYS.WAITLIST);
    const placements = getStorage(STORAGE_KEYS.PLACEMENTS);
    const offers = getStorage(STORAGE_KEYS.OFFERS);
    // ... localStorage logic
}
*/

// AFTER (API):
async function offerPlacement(childId, placementId) {
    const user = getCurrentUser();
    if (!user || user.type !== 'daycare') return;
    
    try {
        const result = await apiCall('/offers', {
            method: 'POST',
            body: JSON.stringify({
                childId,
                daycareId: user.id,
                placementId
            })
        });
        
        if (result.success) {
            showSuccess('Placement offer sent to client!');
            await loadWaitlistCandidates();
        }
    } catch (error) {
        showError(error.message);
    }
}

// BEFORE (localStorage):
/*
function acceptOffer(offerId) {
    const offers = getStorage(STORAGE_KEYS.OFFERS);
    const offer = offers.find(o => o.id === offerId);
    offer.status = 'accepted';
    // ... localStorage logic
}
*/

// AFTER (API):
async function acceptOffer(offerId) {
    try {
        const result = await apiCall(`/offers/${offerId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'accepted' })
        });
        
        if (result.success) {
            showSuccess('Placement offer accepted!');
            await loadClientDashboard();
        }
    } catch (error) {
        showError(error.message);
    }
}

// ==================== UPDATED DASHBOARD FUNCTIONS ====================

// BEFORE (localStorage):
/*
function loadClientDashboard() {
    const user = getCurrentUser();
    const clients = getStorage(STORAGE_KEYS.CLIENTS);
    const client = clients.find(c => c.id === user.id);
    // ... localStorage logic
}
*/

// AFTER (API):
async function loadClientDashboard() {
    const user = getCurrentUser();
    if (!user || user.type !== 'client') return;
    
    try {
        // Get client data from API
        const client = await apiCall(`/clients/${user.id}`);
        
        // Get waitlist
        const waitlist = await apiCall('/waitlist');
        
        // Get offers
        const offers = await apiCall('/offers');
        
        // Update UI with data
        document.getElementById('clientWelcome').textContent = `Welcome, ${client.name}!`;
        
        // Load children
        const childrenList = document.getElementById('childrenList');
        if (!client.children || client.children.length === 0) {
            childrenList.innerHTML = '<p class="empty-state">No children on waitlist yet.</p>';
        } else {
            // Build children list with positions
            const childrenHTML = await Promise.all(
                client.children.map(async (child) => {
                    const position = await getWaitlistPosition(child.id);
                    return `
                        <div class="child-item">
                            <h3>${child.name}</h3>
                            <p><strong>Age:</strong> ${child.age} years</p>
                            <p><strong>Location:</strong> ${child.location}</p>
                            <p><strong>Waitlist Position:</strong> #${position || 'N/A'}</p>
                        </div>
                    `;
                })
            );
            childrenList.innerHTML = childrenHTML.join('');
        }
        
        // Load pending offers
        const clientOffers = offers.filter(o => {
            const waitlistEntry = waitlist.find(w => w.id === o.childId);
            return waitlistEntry && waitlistEntry.clientId === user.id && o.status === 'pending';
        });
        
        const pendingOffers = document.getElementById('pendingOffers');
        if (clientOffers.length === 0) {
            pendingOffers.innerHTML = '<p class="empty-state">No pending offers at this time.</p>';
        } else {
            pendingOffers.innerHTML = clientOffers.map(offer => `
                <div class="offer-item">
                    <h3>Placement Offer for ${offer.childName}</h3>
                    <p><strong>Daycare:</strong> ${offer.daycareName}</p>
                    <p><strong>Location:</strong> ${offer.daycareLocation}</p>
                    <div class="button-group">
                        <button class="btn btn-primary" onclick="acceptOffer('${offer.id}')">Accept</button>
                        <button class="btn btn-secondary" onclick="declineOffer('${offer.id}')">Decline</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        showError('Error loading dashboard: ' + error.message);
    }
}

// Similar updates needed for loadDaycareDashboard() and loadWaitlistCandidates()
