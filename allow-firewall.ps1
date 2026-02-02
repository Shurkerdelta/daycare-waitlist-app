# PowerShell script to allow Node.js server through Windows Firewall
# Run as Administrator

Write-Host "Configuring Windows Firewall for Node.js Server..." -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Remove existing rule if it exists
$existingRule = Get-NetFirewallRule -DisplayName "Node.js Daycare App" -ErrorAction SilentlyContinue
if ($existingRule) {
    Write-Host "Removing existing firewall rule..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "Node.js Daycare App"
}

# Create new firewall rule
try {
    New-NetFirewallRule -DisplayName "Node.js Daycare App" `
        -Direction Inbound `
        -LocalPort 3000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Description "Allows incoming connections to Daycare Waitlist App on port 3000"
    
    Write-Host "`n✓ Firewall rule created successfully!" -ForegroundColor Green
    Write-Host "Port 3000 is now open for incoming connections." -ForegroundColor Green
    Write-Host "`nYou can now access the app from other devices on your network." -ForegroundColor Cyan
} catch {
    Write-Host "`nERROR: Failed to create firewall rule" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Get local IP address
Write-Host "`nYour local IP addresses:" -ForegroundColor Cyan
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object IPAddress, InterfaceAlias

if ($ipAddresses) {
    foreach ($ip in $ipAddresses) {
        Write-Host "  - $($ip.IPAddress) ($($ip.InterfaceAlias))" -ForegroundColor White
        Write-Host "    Access URL: http://$($ip.IPAddress):3000" -ForegroundColor Gray
    }
} else {
    Write-Host "  Could not detect IP address" -ForegroundColor Yellow
}

Write-Host "`nDone!" -ForegroundColor Green
