#!/bin/bash

# Start RepoFlight in development mode

echo "🚀 Starting RepoFlight development environment..."

# Check if PostgreSQL is running
if ! docker ps | grep -q repoflight-postgres; then
    echo "🐳 Starting PostgreSQL..."
    docker-compose up -d postgres
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Check database connection
echo "🔍 Checking database connection..."
if npm run db:push --silent; then
    echo "✅ Database is ready"
else
    echo "❌ Database connection failed. Please check your PostgreSQL setup."
    exit 1
fi

# Start development servers
echo "🔧 Starting development servers..."
npm run dev