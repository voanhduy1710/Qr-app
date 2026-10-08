# PowerShell Local Preview Script for QR Trai Tim App
$Port = 5176
Set-Location $PSScriptRoot

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " QR Trai Tim Web App - Local Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. Check Node.js and npm
Write-Host "[1/3] Checking environment..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed or not in PATH." -ForegroundColor Red
    Exit 1
}

$nodeVersion = node -v
$npmVersion = npm -v
Write-Host "   Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host "   npm version:     $npmVersion" -ForegroundColor Green

# 2. Verify or Install Dependencies
Write-Host "[2/3] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   node_modules folder missing. Running npm install..." -ForegroundColor Blue
    npm install
} else {
    Write-Host "   node_modules verified." -ForegroundColor Green
}

# 3. Launch Vite dev server, reachable from phones on the same Wi-Fi
$lanIp = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)' -and $_.PrefixOrigin -ne 'WellKnown' } |
    Sort-Object { if ($_.IPAddress -like '192.168.*') { 0 } else { 1 } } |
    Select-Object -First 1 -ExpandProperty IPAddress

Write-Host "[3/3] Starting Vite Development Server on Port $Port..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Local App URL:  http://localhost:$Port" -ForegroundColor Green
if ($lanIp) {
    Write-Host "   Phone (Wi-Fi):  http://${lanIp}:$Port" -ForegroundColor Green
    Write-Host "   QR codes opened on localhost point at the Wi-Fi address, so you can scan them." -ForegroundColor Gray
}
Write-Host "================================================" -ForegroundColor Cyan

npm run dev -- --host --port $Port --strictPort
