# PowerShell script to set up Git repository
# Run this after installing Git

Write-Host "Setting up Git repository..." -ForegroundColor Green

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize repository
Write-Host "`nInitializing Git repository..." -ForegroundColor Cyan
git init

# Add all files
Write-Host "Adding files..." -ForegroundColor Cyan
git add .

# Make initial commit
Write-Host "Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Daycare waitlist management system"

Write-Host "`n✓ Local repository initialized!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create a repository on GitHub (https://github.com/new)" -ForegroundColor White
Write-Host "2. Run these commands (replace YOUR_USERNAME):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/daycare-waitlist-app.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host "`nSee GITHUB_SETUP.md for detailed instructions." -ForegroundColor White
