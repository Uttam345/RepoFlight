# RepoFlight

AI-Powered Compliance & Security Copilot with Kiro

[![CI](https://github.com/your-org/repoflight/workflows/CI/badge.svg)](https://github.com/your-org/repoflight/actions)
[![Security](https://img.shields.io/badge/security-scanned-green.svg)](https://github.com/your-org/repoflight/security)

## Overview

RepoFlight is a plug-and-play GitHub application and CLI backed by Kiro agent hooks that continuously audits Git repositories for license compliance, security vulnerabilities, and configuration drift. It provides actionable dashboards, pull-request guards, and auto-generated remediation PRs.

## Features

- 🔍 **License Compliance**: Automated scanning for forbidden licenses (GPL, SSPL, etc.)
- 🛡️ **Security Scanning**: SAST, DAST, and container vulnerability detection
- 📊 **Risk Assessment**: Real-time scoring mapped to enterprise frameworks
- 🤖 **Auto-Remediation**: AI-generated fixes and pull requests
- 📈 **Compliance Dashboard**: Visual metrics and reporting

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 16+ (or Docker for easy setup)
- Docker & Docker Compose (recommended)

### Automated Setup

**Linux/macOS:**
```bash
# Clone the repository
git clone https://github.com/your-org/repoflight.git
cd repoflight

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows (PowerShell):**
```powershell
# Clone the repository
git clone https://github.com/your-org/repoflight.git
cd repoflight

# Run the setup script
.\scripts\setup.ps1
```

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/your-org/repoflight.git
cd repoflight

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start PostgreSQL (with Docker)
docker-compose up -d postgres

# Run database setup
npm run db:push

# Build packages
npm run build

# Start development servers
npm run dev
```

### Docker Setup (Full Stack)

```bash
# Build and run everything with Docker Compose
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Development

```bash
# Start development servers (requires PostgreSQL running)
npm run dev

# Start only the database
docker-compose up -d postgres

# View database in Prisma Studio
npm run db:studio
```

### Access Points

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database Studio**: http://localhost:5555 (when running `npm run db:studio`)

## Architecture

RepoFlight follows a microservices architecture:

- **Hook Server**: Receives GitHub webhooks and orchestrates scans
- **License Agent**: Scans dependencies for license compliance
- **Security Agent**: Performs SAST, DAST, and container scanning
- **Dashboard**: Next.js application for visualization and management
- **Database**: PostgreSQL with Prisma ORM

## Development

### Project Structure

```
repoflight/
├── apps/
│   └── dashboard/          # Next.js dashboard application
├── services/
│   └── hook-server/        # Express.js webhook server
├── packages/
│   ├── agents/            # Scanning agents
│   ├── database/          # Prisma schema and client
│   └── shared/            # Shared types and utilities
└── .kiro/                 # Kiro specifications and hooks
```

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build all packages
- `npm run test` - Run test suites
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
## T
roubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

**Port Already in Use:**
```bash
# Check what's using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

**Build Errors:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

**Prisma Issues:**
```bash
# Reset Prisma client
npm run db:generate

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset --workspace=@repoflight/database
```

### Environment Variables

Make sure these environment variables are set in your `.env` files:

- `DATABASE_URL`: PostgreSQL connection string
- `GITHUB_WEBHOOK_SECRET`: Secret for webhook validation
- `GITHUB_APP_ID`: Your GitHub App ID
- `GITHUB_PRIVATE_KEY`: Your GitHub App private key
- `NEXT_PUBLIC_API_URL`: API URL for the dashboard

### Docker Issues

**Container Won't Start:**
```bash
# Check container logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose build --no-cache
docker-compose up --force-recreate
```

**Permission Issues (Linux/macOS):**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Getting Help

1. Check the [GitHub Issues](https://github.com/your-org/repoflight/issues)
2. Review the application logs
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly

## Performance

### Resource Requirements

- **Memory**: 2GB RAM minimum, 4GB recommended
- **CPU**: 2 cores minimum
- **Storage**: 1GB for application, additional space for scan results
- **Network**: Internet access for GitHub API and vulnerability databases

### Scaling

For production deployments:

- Use a managed PostgreSQL service
- Deploy services separately with load balancing
- Configure Redis for caching and job queues
- Set up monitoring and logging
- Use environment-specific configurations