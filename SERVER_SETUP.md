# Server-Side Storage Implementation Guide

This guide explains how to migrate from localStorage to server-side storage using Node.js/Express.

## Overview

The application now supports both client-side (localStorage) and server-side (API) storage. The server uses a JSON file for persistence (can be upgraded to a database later).

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Enable cross-origin requests
- `bcryptjs` - Password hashing
- `body-parser` - Parse request bodies

### 2. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 3. Update Frontend to Use API

The server is ready, but you need to update `script.js` to use API calls instead of localStorage. See the migration steps below.

## API Endpoints

### Client Endpoints

- `POST /api/clients/register` - Register new client
  ```json
  { "email": "user@example.com", "password": "pass123", "name": "John Doe" }
  ```

- `POST /api/clients/login` - Login client
  ```json
  { "email": "user@example.com", "password": "pass123" }
  ```

- `GET /api/clients/:id` - Get client data

### Daycare Endpoints

- `POST /api/daycares/register` - Register new daycare
  ```json
  { "email": "daycare@example.com", "password": "pass123", "name": "Sunshine Daycare", "location": "123 Main St" }
  ```

- `POST /api/daycares/login` - Login daycare
  ```json
  { "email": "daycare@example.com", "password": "pass123" }
  ```

- `GET /api/daycares/:id` - Get daycare data

### Waitlist Endpoints

- `POST /api/waitlist` - Add child to waitlist
  ```json
  { "clientId": "123", "childName": "Emma", "age": 3, "location": "456 Oak Ave" }
  ```

- `GET /api/waitlist` - Get all waitlist entries

- `GET /api/waitlist/position/:childId` - Get waitlist position

### Placement Endpoints

- `POST /api/placements` - Add placement
  ```json
  { "daycareId": "456", "minAge": 2, "maxAge": 5, "count": 10 }
  ```

- `GET /api/placements` - Get all placements

### Offer Endpoints

- `POST /api/offers` - Create offer
  ```json
  { "childId": "789", "daycareId": "456", "placementId": "101" }
  ```

- `GET /api/offers` - Get all offers

- `PATCH /api/offers/:id` - Update offer status
  ```json
  { "status": "accepted" } // or "declined"
  ```

## Migration Steps

### Step 1: Update Authentication Functions

Replace localStorage-based auth with API calls:

**Before (localStorage):**
```javascript
function registerClient(email, password, name) {
    const clients = getStorage(STORAGE_KEYS.CLIENTS);
    // ... localStorage logic
}
```

**After (API):**
```javascript
async function registerClient(email, password, name) {
    try {
        const response = await fetch('http://localhost:3000/api/clients/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await response.json();
        if (data.success) {
            showSuccess('Registration successful! Please login.');
            return true;
        }
    } catch (error) {
        showError(error.message || 'Registration failed');
        return false;
    }
}
```

### Step 2: Update All Data Access

Replace all `getStorage()` and `setStorage()` calls with API calls.

### Step 3: Make Functions Async

Since API calls are asynchronous, update all functions that use the API to be `async` and use `await`.

## Data Storage

The server stores data in `data.json` in the project root. This file is automatically created on first run.

**Note:** For production, you should:
1. Use a real database (PostgreSQL, MongoDB, etc.)
2. Add authentication tokens (JWT)
3. Add input validation
4. Add rate limiting
5. Use environment variables for configuration

## Testing

1. Start the server: `npm start`
2. Open the app in browser: `http://localhost:3000`
3. Test registration and login
4. Check `data.json` to see stored data

## Production Deployment

For production:
1. Use environment variables (`.env` file)
2. Add database connection
3. Add authentication middleware
4. Deploy to cloud (Heroku, AWS, etc.)
5. Use HTTPS
6. Add error logging
