// API Service - Handles all server communication
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

// Client API
export const clientAPI = {
    register: async (email, password, name) => {
        return apiCall('/clients/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
    },
    
    login: async (email, password) => {
        return apiCall('/clients/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    getClient: async (id) => {
        return apiCall(`/clients/${id}`);
    }
};

// Daycare API
export const daycareAPI = {
    register: async (email, password, name, location) => {
        return apiCall('/daycares/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, location })
        });
    },
    
    login: async (email, password) => {
        return apiCall('/daycares/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    getDaycare: async (id) => {
        return apiCall(`/daycares/${id}`);
    }
};

// Waitlist API
export const waitlistAPI = {
    addChild: async (clientId, childName, age, location) => {
        return apiCall('/waitlist', {
            method: 'POST',
            body: JSON.stringify({ clientId, childName, age, location })
        });
    },
    
    getWaitlist: async () => {
        return apiCall('/waitlist');
    },
    
    getPosition: async (childId) => {
        return apiCall(`/waitlist/position/${childId}`);
    }
};

// Placement API
export const placementAPI = {
    addPlacement: async (daycareId, minAge, maxAge, count) => {
        return apiCall('/placements', {
            method: 'POST',
            body: JSON.stringify({ daycareId, minAge, maxAge, count })
        });
    },
    
    getPlacements: async () => {
        return apiCall('/placements');
    }
};

// Offer API
export const offerAPI = {
    createOffer: async (childId, daycareId, placementId) => {
        return apiCall('/offers', {
            method: 'POST',
            body: JSON.stringify({ childId, daycareId, placementId })
        });
    },
    
    getOffers: async () => {
        return apiCall('/offers');
    },
    
    updateOffer: async (offerId, status) => {
        return apiCall(`/offers/${offerId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
};
