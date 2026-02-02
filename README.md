# Daycare Waitlist Management System

A modern, responsive web application for managing daycare waitlists with support for both client-side (localStorage) and server-side storage.

## Features

- ✨ Modern, clean design with gradient backgrounds
- 📱 Fully responsive layout (mobile, tablet, desktop)
- 🎨 Beautiful UI/UX with smooth animations
- 👥 Two user types: Clients and Daycares
- 📋 Waitlist management with position tracking
- 🎯 Automatic matching algorithm (closest daycare)
- 💾 Server-side storage with Node.js/Express
- 🔐 Secure password hashing (bcrypt)

## Getting Started

### Option 1: Client-Side Only (localStorage)

No prerequisites needed! This works directly in your browser.

1. Open `index.html` in your web browser
2. Or use a simple HTTP server:
   ```bash
   python -m http.server 8000
   # Then open http://localhost:8000
   ```

### Option 2: Server-Side Storage (Recommended for Production)

**Prerequisites:**
- Node.js (v14 or higher)
- npm

**Installation:**

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser to:
   ```
   http://localhost:3000
   ```

The server will:
- Run on port 3000
- Store data in `data.json`
- Provide REST API endpoints
- Hash passwords securely

**Note:** To use server-side storage, you need to update `script.js` to use API calls instead of localStorage. See `SERVER_SETUP.md` for migration guide.

## Project Structure

```
.
├── index.html              # Main HTML file
├── styles.css              # Stylesheet with modern design
├── script.js               # JavaScript for interactivity (localStorage version)
├── server.js               # Express server for API endpoints
├── package.json            # Node.js dependencies
├── data.json               # Server-side data storage (created automatically)
├── SERVER_SETUP.md         # Server setup and migration guide
├── script-api-example.js   # Example API-based functions
└── README.md               # This file
```

## Architecture

### Client-Side Storage (Current)
- Uses browser localStorage
- No server required
- Data persists in browser
- Good for demos/testing

### Server-Side Storage (Available)
- Node.js/Express backend
- JSON file storage (can upgrade to database)
- Secure password hashing
- RESTful API
- Better for production

See `SERVER_SETUP.md` for detailed migration instructions.

## API Endpoints

When using server-side storage, the following endpoints are available:

- `POST /api/clients/register` - Register client
- `POST /api/clients/login` - Login client
- `POST /api/daycares/register` - Register daycare
- `POST /api/daycares/login` - Login daycare
- `POST /api/waitlist` - Add child to waitlist
- `GET /api/waitlist` - Get waitlist
- `POST /api/placements` - Add placement
- `POST /api/offers` - Create offer
- `PATCH /api/offers/:id` - Update offer status

See `SERVER_SETUP.md` for full API documentation.

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## License

Free to use and modify for your projects!
