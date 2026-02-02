# Accessing the App from Other Machines

## Overview

The server is now configured to accept connections from other devices on your network and from the internet (with proper setup).

## Local Network Access (Same WiFi/Network)

### Step 1: Start the Server

```bash
npm start
```

The server will display your local IP address:
```
============================================================
Server is running!
============================================================
Local access:    http://localhost:3000
Network access:  http://192.168.1.100:3000
API endpoint:    http://192.168.1.100:3000/api
============================================================
```

### Step 2: Find Your IP Address (if not shown)

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

### Step 3: Access from Other Devices

On any device connected to the **same network** (WiFi or Ethernet):

1. Open a web browser
2. Go to: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`
3. The app should load!

### Step 4: Configure Firewall (Windows)

Windows Firewall may block incoming connections. To allow it:

**Option A: PowerShell (Run as Administrator)**
```powershell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Option B: Windows Firewall GUI**
1. Open "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `3000` → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Node.js Server" → Finish

## Internet Access (From Anywhere)

To access from outside your local network, you have several options:

### Option 1: Port Forwarding (Home Network)

1. **Find your router's admin page** (usually `192.168.1.1` or `192.168.0.1`)
2. **Log in** to your router
3. **Set up port forwarding:**
   - External Port: `3000` (or any port you choose)
   - Internal IP: Your computer's local IP (e.g., `192.168.1.100`)
   - Internal Port: `3000`
   - Protocol: TCP
4. **Find your public IP:**
   - Visit: https://whatismyipaddress.com
5. **Access from anywhere:**
   - `http://YOUR_PUBLIC_IP:3000`

**⚠️ Security Warning:** This exposes your server to the internet. Only do this for testing or with proper security measures.

### Option 2: Cloud Deployment (Recommended for Production)

Deploy to a cloud service:

**Heroku:**
```bash
# Install Heroku CLI
# Create Procfile with: web: node server.js
heroku create
git push heroku main
```

**Railway:**
```bash
# Install Railway CLI
railway init
railway up
```

**DigitalOcean / AWS / Azure:**
- Create a virtual machine
- Install Node.js
- Clone your repository
- Run `npm install && npm start`

### Option 3: ngrok (Quick Testing - Temporary)

For quick testing without port forwarding:

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or use: winget install ngrok
   ```

2. **Start your server:**
   ```bash
   npm start
   ```

3. **In another terminal, run ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Use the ngrok URL:**
   - ngrok will give you a URL like: `https://abc123.ngrok.io`
   - This URL works from anywhere (temporarily)
   - Share this URL to access your app

## Dynamic IP Address Handling

The frontend automatically detects the server URL based on how you access it:

- **Localhost:** `http://localhost:3000` → API uses `localhost`
- **Network IP:** `http://192.168.1.100:3000` → API uses `192.168.1.100`
- **Domain:** `http://yourdomain.com:3000` → API uses `yourdomain.com`

No configuration needed! The app adapts automatically.

## Troubleshooting

### "Cannot connect" from other devices

1. **Check firewall:** Make sure port 3000 is allowed
2. **Check network:** Devices must be on the same network
3. **Check IP address:** Verify you're using the correct IP
4. **Check server:** Make sure server is running and shows network access URL

### "Connection refused"

- Firewall is blocking the connection
- Server might be listening only on localhost (should be fixed now)
- Port might be in use by another application

### "CORS errors" in browser console

- The server already has CORS enabled
- If you see CORS errors, check that the API_BASE_URL matches your access URL

### Testing Connection

From another device, test the API directly:
```bash
# Replace with your IP
curl http://192.168.1.100:3000/api/waitlist
```

## Security Considerations

### For Local Network Use:
- ✅ Generally safe for trusted networks
- ✅ Use HTTPS in production
- ✅ Consider authentication for sensitive data

### For Internet Access:
- ⚠️ **Use HTTPS** (SSL/TLS certificate)
- ⚠️ **Add authentication** (JWT tokens, sessions)
- ⚠️ **Rate limiting** to prevent abuse
- ⚠️ **Input validation** on all endpoints
- ⚠️ **Environment variables** for sensitive config
- ⚠️ **Regular security updates**

## Production Recommendations

1. **Use a reverse proxy** (nginx, Apache)
2. **Enable HTTPS** with Let's Encrypt
3. **Use environment variables** for configuration
4. **Add authentication middleware**
5. **Implement rate limiting**
6. **Use a proper database** instead of JSON file
7. **Set up logging and monitoring**
8. **Regular backups**

## Quick Reference

| Access Type | URL Format | Setup Required |
|------------|------------|---------------|
| Same Machine | `http://localhost:3000` | None |
| Local Network | `http://192.168.1.100:3000` | Firewall rule |
| Internet (Port Forward) | `http://YOUR_PUBLIC_IP:3000` | Router config + Firewall |
| Internet (ngrok) | `https://abc123.ngrok.io` | ngrok installation |
| Internet (Cloud) | `https://yourdomain.com` | Cloud deployment |
