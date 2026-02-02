# Setting Up GitHub Repository

## Step 1: Install Git

### Option 1: Download Git for Windows (Recommended)
1. Visit: https://git-scm.com/download/win
2. Download the installer
3. Run the installer and follow the prompts
4. **Important:** Choose "Git from the command line and also from 3rd-party software" when prompted
5. Restart your terminal after installation

### Option 2: Using winget
Run in PowerShell (you'll need to approve prompts):
```powershell
winget install Git.Git
```

### Verify Installation
After installing, close and reopen your terminal, then run:
```bash
git --version
```

## Step 2: Configure Git (First Time Only)

Set your name and email (replace with your GitHub credentials):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Local Repository

Navigate to your project directory and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Daycare waitlist management system"
```

## Step 4: Create GitHub Repository

### Via GitHub Website:
1. Go to https://github.com and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `daycare-waitlist-app` (or your preferred name)
4. Description: "Daycare waitlist management system with client and daycare portals"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### Via GitHub CLI (if installed):
```bash
gh repo create daycare-waitlist-app --public --source=. --remote=origin --push
```

## Step 5: Connect and Push to GitHub

After creating the repository on GitHub, you'll see instructions. Run these commands:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/daycare-waitlist-app.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

If you're using SSH instead of HTTPS:
```bash
git remote add origin git@github.com:YOUR_USERNAME/daycare-waitlist-app.git
```

## Step 6: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. The repository is now live!

## Future Updates

To push changes in the future:
```bash
git add .
git commit -m "Description of changes"
git push
```

## Repository Structure

Your repository includes:
- `index.html` - Main HTML file
- `script.js` - Frontend JavaScript (API-based)
- `styles.css` - Styling
- `server.js` - Express server
- `package.json` - Node.js dependencies
- `.gitignore` - Files to exclude from git
- `README.md` - Project documentation
- `data.json` - Server data (excluded via .gitignore)

## Important Notes

- **Never commit `data.json`** - It contains user data and is in `.gitignore`
- **Never commit `node_modules/`** - Dependencies are in `.gitignore`
- **Never commit passwords or API keys** - Use environment variables for production

## Troubleshooting

### Authentication Issues
If you get authentication errors when pushing:
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Branch Name Issues
If you get errors about branch names:
```bash
git branch -M main
```

### Remote Already Exists
If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/daycare-waitlist-app.git
```
