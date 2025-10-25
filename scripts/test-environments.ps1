# Docker Compose Environment Test Script (PowerShell)
# This script validates that all Docker Compose configurations work properly

Write-Host "Testing Docker Compose Environment Configurations..." -ForegroundColor Yellow
Write-Host "=================================================="

# Function to test configuration
function Test-ComposeConfig {
    param(
        [string]$File,
        [string]$EnvName
    )
    
    Write-Host "`nTesting $EnvName environment..." -ForegroundColor Yellow
    Write-Host "File: $File"
    
    try {
        $null = docker-compose -f $File config 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $EnvName configuration is valid" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $EnvName configuration failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error testing $EnvName configuration" -ForegroundColor Red
        return $false
    }
}

# Test all configurations
Write-Host "Testing all Docker Compose configurations..."

$results = @()
$results += Test-ComposeConfig "docker-compose.yml" "Default"
$results += Test-ComposeConfig "docker-compose.development.yml" "Development"
$results += Test-ComposeConfig "docker-compose.test.yml" "Test"
$results += Test-ComposeConfig "docker-compose.production.yml" "Production"

Write-Host "`nChecking environment files..." -ForegroundColor Yellow

# Check environment files exist
$envFiles = @(".env", ".env.development", ".env.test", ".env.production", ".env.example")
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "✅ $envFile exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $envFile missing" -ForegroundColor Red
    }
}

$successCount = ($results | Where-Object { $_ -eq $true }).Count
$totalCount = $results.Count

if ($successCount -eq $totalCount) {
    Write-Host "`nAll environment configurations passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome configurations failed: $successCount/$totalCount passed" -ForegroundColor Yellow
}

Write-Host "`nUsage Examples:" -ForegroundColor Yellow
Write-Host "  Development: docker-compose -f docker-compose.development.yml up"
Write-Host "  Test:        docker-compose -f docker-compose.test.yml up"
Write-Host "  Production:  docker-compose -f docker-compose.production.yml up"
Write-Host "  Default:     docker-compose up"