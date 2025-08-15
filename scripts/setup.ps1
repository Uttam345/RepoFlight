# RepoFlight Setup Script for Windows (PowerShell)

Write-Host "🚀 Setting up RepoFlight for localhost development..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
    
    # Check Node.js version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    exit 1
}

# Check if Docker is available
try {
    docker info | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "⚠️  Docker is not available. You'll need to set up PostgreSQL manually." -ForegroundColor Yellow
    $dockerAvailable = $false
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npm run db:generate

# Setup environment files if they don't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Blue
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "⚠️  No .env.example found, .env already exists" -ForegroundColor Yellow
    }
}

if (-not (Test-Path "services/hook-server/.env")) {
    Write-Host "📝 Creating hook-server .env file..." -ForegroundColor Blue
    if (Test-Path "services/hook-server/.env.example") {
        Copy-Item "services/hook-server/.env.example" "services/hook-server/.env"
    } else {
        Write-Host "⚠️  hook-server .env already exists" -ForegroundColor Yellow
    }
}

# Start database with Docker if available
if ($dockerAvailable) {
    Write-Host "🐳 Starting PostgreSQL with Docker..." -ForegroundColor Blue
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Blue
    Start-Sleep -Seconds 10
    
    # Run database migrations
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
    npm run db:push
    
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Please ensure PostgreSQL is running on localhost:5432" -ForegroundColor Yellow
    Write-Host "   Database: repoflight" -ForegroundColor Yellow
    Write-Host "   User: postgres" -ForegroundColor Yellow
    Write-Host "   Password: password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Then run: npm run db:push" -ForegroundColor Yellow
}

# Build packages
Write-Host "🔨 Building packages..." -ForegroundColor Blue
npm run build

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "To start with Docker:" -ForegroundColor Cyan
Write-Host "  docker-compose up" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Health check: http://localhost:3001/health" -ForegroundColor Cyan