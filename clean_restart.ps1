param(
    [switch]$SkipDeploy
)

# clean_restart.ps1
# Clean restart for QR Trai Tim App (isolated strictly to port 5176)

$Port = 5176
Write-Host "=== QR Trai Tim App Clean Restart Script (Port $Port Isolated) ===" -ForegroundColor Cyan

# Step 1: Clear process on the app port ONLY
Write-Host "`n[1/2] Clearing process on port $Port..." -ForegroundColor Yellow
$pids = netstat -ano | Select-String ":$Port\s" | ForEach-Object {
    if ($_ -match '\s+(\d+)$') { $Matches[1] }
} | Where-Object { $_ -ne '0' } | Select-Object -Unique

if ($pids) {
    $pids | ForEach-Object {
        try {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
            Write-Host "  Killed process on port $Port (PID: $_)" -ForegroundColor Green
        } catch {}
    }
} else {
    Write-Host "  Port $Port is already free." -ForegroundColor Gray
}

# Step 2: Verify the port is free
Write-Host "`n[2/2] Verifying port $Port release..." -ForegroundColor Yellow
$deadline = (Get-Date).AddSeconds(5)
do {
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) { break }
    Start-Sleep -Milliseconds 250
} while ((Get-Date) -lt $deadline)

if ($listener) {
    Write-Host "  Warning: Port $Port is still in use." -ForegroundColor DarkYellow
} else {
    Write-Host "  Port $Port is confirmed free." -ForegroundColor Green
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Cyan

if ($SkipDeploy) {
    Write-Host "Skipped deploy_local.ps1 because -SkipDeploy parameter was provided." -ForegroundColor White
    return
}

# Auto-start deploy_local.ps1
Write-Host "`nStarting deploy_local.ps1..." -ForegroundColor Cyan
& "$PSScriptRoot\deploy_local.ps1"
