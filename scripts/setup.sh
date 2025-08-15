#!/bin/bash

# RepoFlight Setup Script for Localhost Development

set -e

echo "🚀 Setting up RepoFlight for localhost development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed and running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "✅ Docker is available"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker is not available. You'll need to set up PostgreSQL manually."
    DOCKER_AVAILABLE=false
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Setup environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "⚠️  No .env.example found, .env already exists"
fi

if [ ! -f services/hook-server/.env ]; then
    echo "📝 Creating hook-server .env file..."
    cp services/hook-server/.env.example services/hook-server/.env 2>/dev/null || echo "⚠️  hook-server .env already exists"
fi

# Start database with Docker if available
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Run database migrations
    echo "🗄️  Running database migrations..."
    npm run db:push
    
    echo "✅ Database setup complete!"
else
    echo "⚠️  Please ensure PostgreSQL is running on localhost:5432"
    echo "   Database: repoflight"
    echo "   User: postgres"
    echo "   Password: password"
    echo ""
    echo "   Then run: npm run db:push"
fi

# Build packages
echo "🔨 Building packages..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To start with Docker:"
echo "  docker-compose up"
echo ""
echo "Dashboard will be available at: http://localhost:3000"
echo "API will be available at: http://localhost:3001"
echo ""
echo "Health check: http://localhost:3001/health"