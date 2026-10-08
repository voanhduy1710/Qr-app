# ==============================================================================
# PowerShell Vercel Deployment Script for QR Trai Tim Web App
# ==============================================================================
$ProjectName = "qr-app"
Set-Location $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  QR Web App - Vercel Production Deploy Script" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "`n[1/5] Checking environment & Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Exit 1
}
$nodeVersion = node -v
Write-Host "   Node.js Version: $nodeVersion" -ForegroundColor Green

# 2. Vercel access token from environment, .env, or .mcp.json
$vercelToken = $env:VERCEL_ACCESS_TOKEN
if (-not $vercelToken) {
    $vercelToken = $env:VERCEL_TOKEN
}

if (-not $vercelToken -and (Test-Path ".env")) {
    foreach ($line in Get-Content ".env") {
        $trimmed = $line.Trim()
        if ($trimmed -match "^(VERCEL_ACCESS_TOKEN|VERCEL_TOKEN)\s*=\s*(.+)$") {
            $vercelToken = $matches[2].Trim().Trim('"').Trim("'")
            break
        }
    }
}

if (-not $vercelToken -and (Test-Path ".mcp.json")) {
    try {
        $mcpContent = Get-Content ".mcp.json" -Raw | ConvertFrom-Json
        if ($mcpContent.mcpServers.vercel.env.VERCEL_TOKEN) {
            $vercelToken = $mcpContent.mcpServers.vercel.env.VERCEL_TOKEN
        }
    } catch {
        # ignore parse error
    }
}

if (-not $vercelToken) {
    Write-Host "Error: Vercel token not found." -ForegroundColor Red
    Write-Host "   Set VERCEL_ACCESS_TOKEN in .env or `$env:VERCEL_TOKEN." -ForegroundColor Yellow
    Exit 1
}
$env:VERCEL_TOKEN = $vercelToken

$whoamiRaw = npx -y vercel whoami --token $vercelToken 2>&1
$whoami = ($whoamiRaw | Where-Object { $_ -notmatch 'telemetry' -and $_ -notmatch 'Worker' -and $_ -notmatch 'NOTE' } | Select-Object -Last 1)
if ($LASTEXITCODE -ne 0 -or -not $whoami) {
    Write-Host "Error: Vercel token rejected." -ForegroundColor Red
    Write-Host $whoamiRaw -ForegroundColor Red
    Exit 1
}
$whoami = "$whoami".Trim()
Write-Host "   Authenticated Vercel User: $whoami" -ForegroundColor Green

# 3. Dependencies
Write-Host "`n[2/5] Verifying node_modules..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies via npm install..." -ForegroundColor Blue
    npm install
} else {
    Write-Host "   node_modules verified." -ForegroundColor Green
}

# 4. Tests (heart QR must still decode) + production build
Write-Host "`n[3/5] Running tests (npm test)..." -ForegroundColor Yellow
$testOutput = npm test 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed! Fix them before deploying:" -ForegroundColor Red
    Write-Host ($testOutput | Out-String) -ForegroundColor Red
    Exit 1
}
Write-Host "   Tests passed." -ForegroundColor Green

Write-Host "`n[4/5] Running production build check (npm run build)..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Fix compilation errors before deploying:" -ForegroundColor Red
    Write-Host ($buildOutput | Out-String) -ForegroundColor Red
    Exit 1
}
Write-Host "   Build successful! dist/ output verified." -ForegroundColor Green

# 5. Link (first run creates the project -> https://qr-app.vercel.app) and deploy
Write-Host "`n[5/5] Deploying to Production on Vercel account ($whoami)..." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path ".vercel\project.json")) {
    npx -y vercel link --yes --project $ProjectName --token $vercelToken
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Could not link Vercel project '$ProjectName'." -ForegroundColor Red
        Exit 1
    }
}

npx -y vercel deploy --prod --yes --token $vercelToken
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Vercel deployment failed." -ForegroundColor Red
    Exit 1
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Vercel Production Deployment Completed!" -ForegroundColor Green
Write-Host "   https://$ProjectName.vercel.app" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
