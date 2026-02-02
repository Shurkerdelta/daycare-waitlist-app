// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper Function
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

// Storage key for current user (still using localStorage for session)
const CURRENT_USER_KEY = 'daycare_current_user';

// Initialize - No longer needed for server storage, but kept for compatibility
function initStorage() {
    // Server handles data initialization
    console.log('Using server-side storage');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

// Calculate distance between two addresses (simplified - using string comparison)
// In a real app, you'd use geocoding API
function calculateDistance(address1, address2) {
    // Simple distance calculation - normalize addresses and compare
    const normalize = (addr) => addr.toLowerCase().replace(/[^a-z0-9]/g, '');
    const addr1 = normalize(address1);
    const addr2 = normalize(address2);
    
    // If addresses are similar, return small distance
    if (addr1 === addr2) return 0;
    
    // Simple Levenshtein-like distance
    let distance = 0;
    const maxLen = Math.max(addr1.length, addr2.length);
    for (let i = 0; i < maxLen; i++) {
        if (addr1[i] !== addr2[i]) distance++;
    }
    return distance;
}

// Authentication Functions
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

async function loginClient(email, password) {
    try {
        const result = await apiCall('/clients/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (result.success && result.user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
            await loadClientDashboard();
            showPage('clientDashboard');
            return true;
        }
    } catch (error) {
        showError(error.message);
        return false;
    }
}

async function registerDaycare(email, password, name, location) {
    try {
        const result = await apiCall('/daycares/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, location })
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

async function loginDaycare(email, password) {
    try {
        const result = await apiCall('/daycares/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (result.success && result.user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
            await loadDaycareDashboard();
            showPage('daycareDashboard');
            return true;
        }
    } catch (error) {
        showError(error.message);
        return false;
    }
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    showPage('landingPage');
}

function getCurrentUser() {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// Waitlist Functions
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

async function getWaitlistPosition(childId) {
    try {
        const result = await apiCall(`/waitlist/position/${childId}`);
        return result.position;
    } catch (error) {
        console.error('Error getting position:', error);
        return null;
    }
}

// Placement Functions
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

// Client Dashboard Functions
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
        
        // Update welcome message
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

async function declineOffer(offerId) {
    try {
        const result = await apiCall(`/offers/${offerId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'declined' })
        });
        
        if (result.success) {
            showSuccess('Placement offer declined.');
            await loadClientDashboard();
        }
    } catch (error) {
        showError(error.message);
    }
}

// Daycare Dashboard Functions
async function loadDaycareDashboard() {
    const user = getCurrentUser();
    if (!user || user.type !== 'daycare') return;
    
    try {
        // Get daycare data from API
        const daycare = await apiCall(`/daycares/${user.id}`);
        
        // Get placements
        const placements = await apiCall('/placements');
        const daycarePlacements = placements.filter(p => p.daycareId === user.id);
        
        // Update welcome message
        document.getElementById('daycareWelcome').textContent = `Welcome, ${daycare.name}!`;
        
        // Load placements
        const placementsList = document.getElementById('placementsList');
        if (!daycarePlacements || daycarePlacements.length === 0) {
            placementsList.innerHTML = '<p class="empty-state">No placements added yet.</p>';
        } else {
            placementsList.innerHTML = daycarePlacements.map(placement => `
                <div class="placement-item">
                    <h3>Ages ${placement.minAge}-${placement.maxAge}</h3>
                    <p><strong>Total:</strong> ${placement.totalCount}</p>
                    <p><strong>Available:</strong> ${placement.availableCount}</p>
                </div>
            `).join('');
        }
        
        // Load waitlist candidates
        await loadWaitlistCandidates();
    } catch (error) {
        showError('Error loading dashboard: ' + error.message);
    }
}

async function loadWaitlistCandidates() {
    const user = getCurrentUser();
    if (!user || user.type !== 'daycare') return;
    
    try {
        // Get placements
        const placements = await apiCall('/placements');
        const daycarePlacements = placements.filter(p => p.daycareId === user.id && p.availableCount > 0);
        
        if (daycarePlacements.length === 0) {
            document.getElementById('waitlistCandidates').innerHTML = '<p class="empty-state">No available placements to match.</p>';
            return;
        }
        
        // Get waitlist and offers
        const waitlist = await apiCall('/waitlist');
        const offers = await apiCall('/offers');
        
        // Get daycare data for location
        const daycare = await apiCall(`/daycares/${user.id}`);
        
        if (!daycare || !daycare.location) {
            document.getElementById('waitlistCandidates').innerHTML = '<p class="empty-state">Daycare location not found.</p>';
            return;
        }
        
        // Find candidates that match age ranges and don't have pending offers from this daycare
        const candidates = waitlist.filter(client => {
            // Check if already has pending offer from this daycare
            const hasPendingOffer = offers.some(o => 
                o.childId === client.id && 
                o.daycareId === user.id && 
                o.status === 'pending'
            );
            if (hasPendingOffer) return false;
            
            // Check if matches any placement age range
            return daycarePlacements.some(p => 
                client.age >= p.minAge && 
                client.age <= p.maxAge
            );
        });
        
        // Calculate distances and sort
        candidates.forEach(client => {
            const matchingPlacement = daycarePlacements.find(p => 
                client.age >= p.minAge && client.age <= p.maxAge
            );
            if (matchingPlacement) {
                client.distance = calculateDistance(client.location, daycare.location);
            } else {
                client.distance = Infinity;
            }
        });
        
        // Sort by distance (closest first), then by date added (FIFO)
        candidates.sort((a, b) => {
            if (a.distance !== b.distance) {
                return a.distance - b.distance;
            }
            return new Date(a.dateAdded) - new Date(b.dateAdded);
        });
        
        const candidatesList = document.getElementById('waitlistCandidates');
        if (candidates.length === 0) {
            candidatesList.innerHTML = '<p class="empty-state">No matching candidates at this time.</p>';
        } else {
            candidatesList.innerHTML = candidates.map(client => {
                const matchingPlacement = daycarePlacements.find(p => 
                    client.age >= p.minAge && client.age <= p.maxAge
                );
                const existingOffer = offers.find(o => o.childId === client.id && o.daycareId === user.id);
                
                return `
                    <div class="candidate-item">
                        <h3>${client.childName}</h3>
                        <p><strong>Age:</strong> ${client.age} years</p>
                        <p><strong>Location:</strong> ${client.location}</p>
                        <p><strong>Distance:</strong> ${client.distance === 0 ? 'Same location' : client.distance === Infinity ? 'N/A' : `Distance score: ${client.distance}`}</p>
                        <p><strong>Matching Placement:</strong> Ages ${matchingPlacement.minAge}-${matchingPlacement.maxAge}</p>
                        ${existingOffer ? 
                            `<p class="status-badge">Status: ${existingOffer.status}</p>` :
                            `<div class="button-group">
                                <button class="btn btn-primary" onclick="offerPlacement('${client.id}', '${matchingPlacement.id}')">Offer Placement</button>
                                <button class="btn btn-secondary" onclick="skipCandidate('${client.id}')">Skip</button>
                            </div>`
                        }
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        showError('Error loading candidates: ' + error.message);
    }
}

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

function skipCandidate(childId) {
    // Just refresh the list - the candidate will remain in waitlist
    loadWaitlistCandidates();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    initStorage();
    
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
        if (user.type === 'client') {
            await loadClientDashboard();
            showPage('clientDashboard');
        } else {
            await loadDaycareDashboard();
            showPage('daycareDashboard');
        }
    }
    
    // Landing page buttons
    document.getElementById('clientLoginBtn').addEventListener('click', () => {
        showPage('clientAuthPage');
        switchAuthTab('clientAuthPage', 'login');
    });
    
    document.getElementById('daycareLoginBtn').addEventListener('click', () => {
        showPage('daycareAuthPage');
        switchAuthTab('daycareAuthPage', 'login');
    });
    
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.closest('.page').id;
            const tab = e.target.dataset.tab;
            switchAuthTab(page, tab);
        });
    });
    
    // Client login form
    document.getElementById('clientLoginFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('clientEmail').value;
        const password = document.getElementById('clientPassword').value;
        await loginClient(email, password);
    });
    
    // Client register form
    document.getElementById('clientRegisterFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('clientRegEmail').value;
        const password = document.getElementById('clientRegPassword').value;
        const name = document.getElementById('clientName').value;
        const success = await registerClient(email, password, name);
        if (success) {
            switchAuthTab('clientAuthPage', 'login');
            document.getElementById('clientEmail').value = email;
        }
    });
    
    // Daycare login form
    document.getElementById('daycareLoginFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('daycareEmail').value;
        const password = document.getElementById('daycarePassword').value;
        await loginDaycare(email, password);
    });
    
    // Daycare register form
    document.getElementById('daycareRegisterFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('daycareRegEmail').value;
        const password = document.getElementById('daycareRegPassword').value;
        const name = document.getElementById('daycareName').value;
        const location = document.getElementById('daycareLocation').value;
        const success = await registerDaycare(email, password, name, location);
        if (success) {
            switchAuthTab('daycareAuthPage', 'login');
            document.getElementById('daycareEmail').value = email;
        }
    });
    
    // Add child form
    document.getElementById('addChildForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const childName = document.getElementById('childName').value;
        const age = document.getElementById('childAge').value;
        const location = document.getElementById('childLocation').value;
        await addChildToWaitlist(childName, age, location);
        e.target.reset();
    });
    
    // Add placement form
    document.getElementById('addPlacementForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const minAge = document.getElementById('placementMinAge').value;
        const maxAge = document.getElementById('placementMaxAge').value;
        const count = document.getElementById('placementCount').value;
        
        if (parseInt(minAge) > parseInt(maxAge)) {
            showError('Minimum age cannot be greater than maximum age');
            return;
        }
        
        await addPlacement(minAge, maxAge, count);
        e.target.reset();
    });
});

function switchAuthTab(pageId, tab) {
    const page = document.getElementById(pageId);
    const tabs = page.querySelectorAll('.tab-btn');
    const forms = page.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    page.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    if (pageId === 'clientAuthPage') {
        if (tab === 'login') {
            document.getElementById('clientLoginForm').classList.add('active');
        } else {
            document.getElementById('clientRegisterForm').classList.add('active');
        }
    } else {
        if (tab === 'login') {
            document.getElementById('daycareLoginForm').classList.add('active');
        } else {
            document.getElementById('daycareRegisterForm').classList.add('active');
        }
    }
}

// Make functions available globally for onclick handlers
window.showPage = showPage;
window.logout = logout;
window.acceptOffer = acceptOffer;
window.declineOffer = declineOffer;
window.offerPlacement = offerPlacement;
window.skipCandidate = skipCandidate;
