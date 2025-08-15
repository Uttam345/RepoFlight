# Docker Configuration Guide

This guide explains how to configure and run RepoFlight using Docker for both development and production environments.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available for containers
- 10GB+ disk space

## Quick Start

### Development Environment

```bash
# Start development environment
npm run docker:dev

# Or use the script directly
./scripts/docker-dev.sh up

# View logs
npm run docker:dev:logs

# Stop services
npm run docker:dev:down
```

### Production Environment

```bash
# Configure production environment
cp .env.docker.prod.example .env.docker.prod
# Edit .env.docker.prod with your production values

# Start production environment
npm run docker:prod

# Or use the script directly
./scripts/docker-prod.sh up
```

## Configuration Files

### Development Configuration

- **docker-compose.yml**: Main development compose file
- **.env.docker**: Development environment variables
- **services/*/Dockerfile.dev**: Development Dockerfiles

### Production Configuration

- **docker-compose.prod.yml**: Production compose file
- **.env.docker.prod**: Production environment variables
- **nginx/nginx.conf**: Nginx reverse proxy configuration

## Services

### PostgreSQL Database
- **Image**: postgres:16-alpine
- **Port**: 5432 (development only)
- **Volume**: postgres_data
- **Health Check**: pg_isready

### Redis Cache
- **Image**: redis:7-alpine
- **Port**: 6379 (development only)
- **Volume**: redis_data
- **Health Check**: redis-cli ping

### Hook Server (API)
- **Build**: services/hook-server/Dockerfile.dev
- **Port**: 3001
- **Health Check**: /health endpoint

### Dashboard (Frontend)
- **Build**: apps/dashboard/Dockerfile.dev
- **Port**: 3000
- **Health Check**: HTTP GET /

### Nginx (Production Only)
- **Image**: nginx:alpine
- **Ports**: 80, 443
- **Config**: nginx/nginx.conf

## Environment Variables

### Required for Production

```bash
# Database
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_PASSWORD=your-secure-password

# GitHub App Configuration
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_APP_ID=your-app-id
GITHUB_PRIVATE_KEY=your-private-key

# Domain Configuration
CORS_ORIGIN=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Optional Configuration

```bash
# Logging
LOG_LEVEL=warn

# Resource Limits
POSTGRES_MAX_CONNECTIONS=100
REDIS_MAXMEMORY=512mb
```

## Docker Commands

### Development Scripts

```bash
# Management script
./scripts/docker-dev.sh [command]

# Available commands:
up          # Start all services
down        # Stop all services
restart     # Restart all services
build       # Build all images
rebuild     # Rebuild from scratch
logs        # Show logs
logs [svc]  # Show logs for specific service
shell [svc] # Open shell in container
db          # Start only database services
status      # Show service status
clean       # Remove everything
reset       # Clean and rebuild
```

### Production Scripts

```bash
# Management script
./scripts/docker-prod.sh [command]

# Available commands:
up          # Start production services
down        # Stop all services
restart     # Restart all services
build       # Build production images
rebuild     # Rebuild from scratch
logs        # Show logs
status      # Show service status
backup      # Backup database
restore     # Restore database
update      # Update and restart
```

### Manual Docker Commands

```bash
# Development
docker-compose --env-file .env.docker up -d
docker-compose --env-file .env.docker down
docker-compose --env-file .env.docker logs -f

# Production
docker-compose --env-file .env.docker.prod -f docker-compose.prod.yml up -d
docker-compose --env-file .env.docker.prod -f docker-compose.prod.yml down
```

## Volumes and Data Persistence

### Development Volumes
- `postgres_data`: Database data
- `redis_data`: Redis data
- `hook_server_node_modules`: Node modules cache
- `dashboard_node_modules`: Node modules cache
- `dashboard_next`: Next.js build cache

### Production Volumes
- `postgres_prod_data`: Production database data
- `redis_prod_data`: Production Redis data

## Networking

### Development Network
- **Name**: repoflight-network
- **Driver**: bridge
- **Internal Communication**: Service names as hostnames

### Production Network
- **Name**: repoflight-prod-network
- **Driver**: bridge
- **External Access**: Only through Nginx proxy

## Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready -U postgres -d repoflight`
- **Redis**: `redis-cli ping`
- **Hook Server**: `curl -f http://localhost:3001/health`
- **Dashboard**: `curl -f http://localhost:3000`

## Resource Limits

### Development
- No specific limits (uses available resources)

### Production
- **Hook Server**: 512MB memory limit, 256MB reservation
- **Dashboard**: 512MB memory limit, 256MB reservation
- **PostgreSQL**: Configured via environment variables
- **Redis**: 512MB max memory with LRU eviction

## Security Considerations

### Development
- Default passwords (change for any external access)
- All ports exposed to localhost
- Debug logging enabled

### Production
- Strong passwords required
- Internal networking only
- Nginx reverse proxy with security headers
- Rate limiting configured
- Minimal logging

## Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check logs
./scripts/docker-dev.sh logs [service-name]

# Check service status
./scripts/docker-dev.sh status

# Rebuild images
./scripts/docker-dev.sh rebuild
```

**Database connection issues:**
```bash
# Check PostgreSQL logs
./scripts/docker-dev.sh logs postgres

# Restart database
docker-compose restart postgres

# Reset database
./scripts/docker-dev.sh clean
./scripts/docker-dev.sh up
```

**Port conflicts:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Stop conflicting services
sudo systemctl stop postgresql  # If local PostgreSQL is running
```

**Build failures:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
./scripts/docker-dev.sh rebuild
```

### Performance Issues

**Slow startup:**
- Increase Docker memory allocation (4GB+ recommended)
- Use SSD storage for Docker volumes
- Close unnecessary applications

**High memory usage:**
- Adjust resource limits in docker-compose files
- Monitor with `docker stats`
- Consider using Docker Desktop resource limits

### Logs and Monitoring

```bash
# View all logs
./scripts/docker-dev.sh logs

# View specific service logs
./scripts/docker-dev.sh logs hook-server

# Follow logs in real-time
docker-compose logs -f --tail=100

# Check container resource usage
docker stats
```

## Production Deployment

### SSL/TLS Configuration

1. Obtain SSL certificates
2. Place certificates in `nginx/ssl/`
3. Uncomment HTTPS server block in `nginx/nginx.conf`
4. Update environment variables with HTTPS URLs

### Domain Configuration

1. Point your domain to the server
2. Update `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL`
3. Configure DNS records
4. Test webhook endpoints

### Monitoring and Logging

Consider adding:
- Log aggregation (ELK stack, Fluentd)
- Monitoring (Prometheus, Grafana)
- Alerting (AlertManager)
- Backup automation

### Scaling

For high-traffic deployments:
- Use Docker Swarm or Kubernetes
- Implement load balancing
- Use managed database services
- Configure Redis clustering
- Set up CDN for static assets

## Backup and Recovery

### Database Backup
```bash
# Create backup
./scripts/docker-prod.sh backup

# Restore from backup
./scripts/docker-prod.sh restore backup_20231201_120000.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v postgres_prod_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v postgres_prod_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Support

For Docker-related issues:
1. Check this documentation
2. Review Docker logs
3. Verify environment configuration
4. Check system resources
5. Consult Docker documentation