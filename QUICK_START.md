# Quick Start Guide - Server-Side Storage

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
API available at http://localhost:3000/api
```

### 3. Open the App
Open your browser to: `http://localhost:3000`

## ✅ What's Working

- ✅ Server is running
- ✅ API endpoints are ready
- ✅ Data storage in `data.json`
- ✅ Password hashing with bcrypt
- ✅ CORS enabled for frontend

## ⚠️ What Needs to Be Done

The frontend (`script.js`) still uses localStorage. To use the server:

1. **Option A: Manual Migration** (Recommended for learning)
   - Follow examples in `script-api-example.js`
   - Update functions in `script.js` one by one
   - See `SERVER_SETUP.md` for detailed guide

2. **Option B: Use Both** (Hybrid approach)
   - Keep localStorage as fallback
   - Add API calls where needed
   - Gradually migrate

## 📝 Testing the API

You can test the API directly using curl or Postman:

```bash
# Register a client
curl -X POST http://localhost:3000/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/clients/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔍 Viewing Data

Check `data.json` to see stored data:
```bash
cat data.json
```

## 🛠️ Next Steps

1. Update `script.js` to use API (see examples)
2. Test all functionality
3. Consider adding:
   - JWT authentication tokens
   - Input validation
   - Error handling
   - Database (PostgreSQL, MongoDB)
   - Environment variables

## 📚 Documentation

- `SERVER_SETUP.md` - Full setup and migration guide
- `script-api-example.js` - Code examples
- `README.md` - Project overview
