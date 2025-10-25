# Docker Compose Helper Scripts
# These scripts ensure environment variables are loaded correctly

Write-Host "Art Management Tool - Docker Compose Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to run docker-compose with proper env file
function Start-Environment {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("development", "test", "production", "default")]
        [string]$Environment,
        
        [Parameter(Mandatory=$false)]
        [string[]]$AdditionalArgs = @()
    )
    
    $composeFile = if ($Environment -eq "default") { "docker-compose.yml" } else { "docker-compose.$Environment.yml" }
    $envFile = if ($Environment -eq "default") { ".env" } else { ".env.$Environment" }
    
    Write-Host "Starting $Environment environment..." -ForegroundColor Green
    Write-Host "Compose file: $composeFile" -ForegroundColor Gray
    Write-Host "Env file: $envFile" -ForegroundColor Gray
    Write-Host ""
    
    $composeArgs = @("--env-file", $envFile, "-f", $composeFile) + $AdditionalArgs
    & docker-compose $composeArgs
}

# Menu
Write-Host "Select an environment:" -ForegroundColor Yellow
Write-Host "1. Development (hot-reload, port 8080/3000/5432)"
Write-Host "2. Test (optimized, port 8081/3002/5433)"
Write-Host "3. Production (secure, port 8080/3000/5432)"
Write-Host "4. Default"
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        $action = Read-Host "Action? (up/down/logs/config/ps)"
        Start-Environment -Environment "development" -AdditionalArgs $action
    }
    "2" {
        $action = Read-Host "Action? (up/down/logs/config/ps)"
        Start-Environment -Environment "test" -AdditionalArgs $action
    }
    "3" {
        $action = Read-Host "Action? (up/down/logs/config/ps)"
        Start-Environment -Environment "production" -AdditionalArgs $action
    }
    "4" {
        $action = Read-Host "Action? (up/down/logs/config/ps)"
        Start-Environment -Environment "default" -AdditionalArgs $action
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}