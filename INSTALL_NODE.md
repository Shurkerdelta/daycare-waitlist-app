# Installing Node.js and npm

## Option 1: Download and Install Manually (Recommended)

1. **Visit the Node.js website:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for Windows
   - This will download a `.msi` installer file

2. **Run the installer:**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - Accept the license agreement
   - Keep the default installation path
   - **Important:** Make sure "Add to PATH" is checked (it should be by default)
   - Click "Install"

3. **Verify installation:**
   - Close and reopen your terminal/PowerShell
   - Run these commands:
     ```bash
     node --version
     npm --version
     ```
   - You should see version numbers for both

## Option 2: Using winget (Command Line)

If you prefer command line, you can run this in PowerShell (as Administrator):

```powershell
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
```

Then close and reopen your terminal.

## After Installation

Once Node.js is installed, you can:

1. **Install project dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

## Troubleshooting

- **If commands don't work after installation:**
  - Close and reopen your terminal/PowerShell window
  - The PATH environment variable needs to be refreshed

- **If you get permission errors:**
  - Make sure you're running PowerShell as Administrator (right-click → Run as Administrator)

- **Check if Node.js is in PATH:**
  ```powershell
  $env:PATH -split ';' | Select-String node
  ```

## What You're Installing

- **Node.js**: JavaScript runtime that allows you to run JavaScript on the server
- **npm**: Node Package Manager (comes bundled with Node.js) - used to install JavaScript packages

Both are required to run the server-side application.
