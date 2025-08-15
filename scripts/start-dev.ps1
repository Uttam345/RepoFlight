# Start RepoFlight in development mode (Windows PowerShell)

Write-Host "🚀 Starting RepoFlight development environment..." -ForegroundColor Green

# Check if PostgreSQL is running
try {
    $postgresRunning = docker ps --format "table {{.Names}}" | Select-String "repoflight-postgres"
    if (-not $postgresRunning) {
        Write-Host "🐳 Starting PostgreSQL..." -ForegroundColor Blue
        docker-compose up -d postgres
        Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Blue
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "🐳 Starting PostgreSQL..." -ForegroundColor Blue
    docker-compose up -d postgres
    Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Blue
    Start-Sleep -Seconds 5
}

# Check database connection
Write-Host "🔍 Checking database connection..." -ForegroundColor Blue
try {
    npm run db:push --silent
    Write-Host "✅ Database is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed. Please check your PostgreSQL setup." -ForegroundColor Red
    exit 1
}

# Start development servers
Write-Host "🔧 Starting development servers..." -ForegroundColor Blue
npm run dev