#!/bin/bash

# Docker Production Management Script

set -e

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.docker.prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  up          Start all services in production mode"
    echo "  down        Stop all services"
    echo "  restart     Restart all services"
    echo "  build       Build all images"
    echo "  rebuild     Rebuild all images from scratch"
    echo "  logs        Show logs for all services"
    echo "  logs [svc]  Show logs for specific service"
    echo "  status      Show status of all services"
    echo "  backup      Backup database"
    echo "  restore     Restore database from backup"
    echo "  update      Update and restart services"
    echo ""
    echo "Services: postgres, redis, hook-server, dashboard, nginx"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker is not running${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
}

check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ Environment file $ENV_FILE not found${NC}"
        echo -e "${YELLOW}Please create $ENV_FILE with production configuration${NC}"
        exit 1
    fi

    # Check for required variables
    local required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "GITHUB_WEBHOOK_SECRET" "GITHUB_APP_ID")
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$ENV_FILE" || grep -q "^$var=.*change.*" "$ENV_FILE"; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing or default values for required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo -e "${YELLOW}Please update $ENV_FILE with production values${NC}"
        exit 1
    fi
}

wait_for_service() {
    local service=$1
    local max_attempts=60
    local attempt=1

    echo -e "${BLUE}⏳ Waiting for $service to be healthy...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE ps $service | grep -q "healthy"; then
            echo -e "${GREEN}✅ $service is healthy${NC}"
            return 0
        fi
        
        if [ $((attempt % 10)) -eq 0 ]; then
            echo -e "${YELLOW}   Still waiting... ($attempt/$max_attempts)${NC}"
        fi
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service failed to become healthy${NC}"
    docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE logs $service
    return 1
}

backup_database() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${BLUE}💾 Creating database backup: $backup_file${NC}"
    
    docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE exec -T postgres pg_dump -U postgres repoflight > "$backup_file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
    else
        echo -e "${RED}❌ Backup failed${NC}"
        return 1
    fi
}

case "${1:-}" in
    "up")
        check_docker
        check_env_file
        echo -e "${BLUE}🚀 Starting RepoFlight production environment...${NC}"
        
        # Start database services first
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d postgres redis
        wait_for_service postgres
        wait_for_service redis
        
        # Run database migrations
        echo -e "${BLUE}🔧 Running database migrations...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE run --rm hook-server npm run db:push
        
        # Start application services
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d hook-server dashboard
        wait_for_service hook-server
        wait_for_service dashboard
        
        # Start nginx if configured
        if grep -q "nginx:" $COMPOSE_FILE; then
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d nginx
        fi
        
        echo -e "${GREEN}🎉 Production environment is running!${NC}"
        echo -e "${BLUE}🌐 Application: http://localhost${NC}"
        echo -e "${BLUE}❤️  Health: http://localhost/health${NC}"
        ;;
    
    "down")
        check_docker
        echo -e "${BLUE}🛑 Stopping production services...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE down
        echo -e "${GREEN}✅ All services stopped${NC}"
        ;;
    
    "restart")
        check_docker
        echo -e "${BLUE}🔄 Restarting production services...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE restart
        echo -e "${GREEN}✅ All services restarted${NC}"
        ;;
    
    "build")
        check_docker
        echo -e "${BLUE}🔨 Building production images...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE build
        echo -e "${GREEN}✅ All images built${NC}"
        ;;
    
    "rebuild")
        check_docker
        echo -e "${BLUE}🔨 Rebuilding production images from scratch...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE build --no-cache
        echo -e "${GREEN}✅ All images rebuilt${NC}"
        ;;
    
    "logs")
        check_docker
        if [ -n "${2:-}" ]; then
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f $2
        else
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f
        fi
        ;;
    
    "status")
        check_docker
        echo -e "${BLUE}📊 Production Service Status:${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE ps
        ;;
    
    "backup")
        check_docker
        backup_database
        ;;
    
    "restore")
        check_docker
        if [ -n "${2:-}" ]; then
            echo -e "${BLUE}📥 Restoring database from: $2${NC}"
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE exec -T postgres psql -U postgres -d repoflight < "$2"
            echo -e "${GREEN}✅ Database restored${NC}"
        else
            echo -e "${RED}❌ Please specify backup file${NC}"
            echo "Usage: $0 restore <backup_file.sql>"
        fi
        ;;
    
    "update")
        check_docker
        check_env_file
        echo -e "${BLUE}🔄 Updating production environment...${NC}"
        
        # Create backup before update
        backup_database
        
        # Pull latest images and rebuild
        $0 build
        
        # Restart services
        $0 restart
        
        echo -e "${GREEN}✅ Update complete${NC}"
        ;;
    
    *)
        print_usage
        exit 1
        ;;
esac