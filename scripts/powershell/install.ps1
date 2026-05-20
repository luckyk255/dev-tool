# ==================== Linux Commands One-Click Installer ====================
# This script will download and install linux-cmd.ps1 to your PowerShell profile

$ErrorActionPreference = "Stop"

Write-Host "`n==== Linux Commands Installer ====" -ForegroundColor Cyan
Write-Host ""

# GitHub raw file URL
$githubUrl = "https://raw.githubusercontent.com/luckyk255/dev-tool/main/scripts/powershell/linux-cmd.ps1"

# Local installation path
$installDir = Join-Path $env:USERPROFILE ".powershell-linux-cmd"
$scriptPath = Join-Path $installDir "linux-cmd.ps1"

# Create installation directory if it doesn't exist
if (-not (Test-Path $installDir)) {
    Write-Host "Creating installation directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Download or use local file
if (Test-Path (Join-Path $PSScriptRoot "linux-cmd.ps1")) {
    Write-Host "Found local linux-cmd.ps1, copying..." -ForegroundColor Yellow
    Copy-Item (Join-Path $PSScriptRoot "linux-cmd.ps1") $scriptPath -Force
} else {
    Write-Host "Downloading linux-cmd.ps1 from GitHub..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $githubUrl -OutFile $scriptPath -UseBasicParsing
        Write-Host "Downloaded successfully!" -ForegroundColor Green
    } catch {
        Write-Error "Failed to download from GitHub. Please check the URL or your internet connection."
        exit 1
    }
}

# Get PowerShell profile path
$profilePath = $PROFILE.CurrentUserAllHosts

Write-Host "Profile path: $profilePath" -ForegroundColor Yellow

# Create profile directory if it doesn't exist
$profileDir = Split-Path $profilePath -Parent
if (-not (Test-Path $profileDir)) {
    Write-Host "Creating profile directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

# Create profile file if it doesn't exist
if (-not (Test-Path $profilePath)) {
    Write-Host "Creating profile file..." -ForegroundColor Yellow
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
}

# Check if already installed
$sourceCommand = ". `"$scriptPath`""
$profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue

if ($profileContent -and $profileContent.Contains($sourceCommand)) {
    Write-Host "Linux commands are already installed in your profile!" -ForegroundColor Green
    Write-Host ""
    $response = Read-Host "Do you want to reinstall? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
    # Remove old entry
    $profileContent = $profileContent -replace [regex]::Escape($sourceCommand), ""
    $profileContent = $profileContent.Trim()
    Set-Content -Path $profilePath -Value $profileContent
}

# Add source command to profile
Write-Host "Adding linux-cmd.ps1 to your PowerShell profile..." -ForegroundColor Yellow

$installBlock = @"

# ==================== Linux Commands ====================
# Auto-load Linux commands compatibility layer
$sourceCommand
"@

Add-Content -Path $profilePath -Value $installBlock

Write-Host ""
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart PowerShell, or run: . `$PROFILE" -ForegroundColor White
Write-Host "  2. Enjoy Linux commands in PowerShell!" -ForegroundColor White
Write-Host ""
Write-Host "To uninstall, edit your profile: notepad `$PROFILE" -ForegroundColor Gray
Write-Host ""
