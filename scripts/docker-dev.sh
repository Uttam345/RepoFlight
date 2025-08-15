#!/bin/bash

# Docker Development Management Script

set -e

COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.docker"

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
    echo "  up          Start all services"
    echo "  down        Stop all services"
    echo "  restart     Restart all services"
    echo "  build       Build all images"
    echo "  rebuild     Rebuild all images from scratch"
    echo "  logs        Show logs for all services"
    echo "  logs [svc]  Show logs for specific service"
    echo "  shell [svc] Open shell in service container"
    echo "  db          Start only database services"
    echo "  status      Show status of all services"
    echo "  clean       Remove all containers, volumes, and images"
    echo "  reset       Reset everything (clean + rebuild)"
    echo ""
    echo "Services: postgres, redis, hook-server, dashboard"
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

wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1

    echo -e "${BLUE}⏳ Waiting for $service to be healthy...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE ps $service | grep -q "healthy"; then
            echo -e "${GREEN}✅ $service is healthy${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service failed to become healthy${NC}"
    return 1
}

case "${1:-}" in
    "up")
        check_docker
        echo -e "${BLUE}🚀 Starting RepoFlight development environment...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d
        
        wait_for_service postgres
        wait_for_service redis
        
        echo -e "${BLUE}🔧 Running database migrations...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE exec hook-server npm run db:push
        
        wait_for_service hook-server
        wait_for_service dashboard
        
        echo -e "${GREEN}🎉 All services are running!${NC}"
        echo -e "${BLUE}📊 Dashboard: http://localhost:3000${NC}"
        echo -e "${BLUE}🔗 API: http://localhost:3001${NC}"
        echo -e "${BLUE}❤️  Health: http://localhost:3001/health${NC}"
        ;;
    
    "down")
        check_docker
        echo -e "${BLUE}🛑 Stopping all services...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE down
        echo -e "${GREEN}✅ All services stopped${NC}"
        ;;
    
    "restart")
        check_docker
        echo -e "${BLUE}🔄 Restarting all services...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE restart
        echo -e "${GREEN}✅ All services restarted${NC}"
        ;;
    
    "build")
        check_docker
        echo -e "${BLUE}🔨 Building all images...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE build
        echo -e "${GREEN}✅ All images built${NC}"
        ;;
    
    "rebuild")
        check_docker
        echo -e "${BLUE}🔨 Rebuilding all images from scratch...${NC}"
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
    
    "shell")
        check_docker
        if [ -n "${2:-}" ]; then
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE exec $2 sh
        else
            echo -e "${RED}❌ Please specify a service name${NC}"
            echo "Available services: postgres, redis, hook-server, dashboard"
        fi
        ;;
    
    "db")
        check_docker
        echo -e "${BLUE}🗄️  Starting database services...${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d postgres redis
        wait_for_service postgres
        wait_for_service redis
        echo -e "${GREEN}✅ Database services are running${NC}"
        ;;
    
    "status")
        check_docker
        echo -e "${BLUE}📊 Service Status:${NC}"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE ps
        ;;
    
    "clean")
        check_docker
        echo -e "${YELLOW}⚠️  This will remove all containers, volumes, and images. Continue? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo -e "${BLUE}🧹 Cleaning up...${NC}"
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE down -v --rmi all
            docker system prune -f
            echo -e "${GREEN}✅ Cleanup complete${NC}"
        else
            echo -e "${BLUE}ℹ️  Cleanup cancelled${NC}"
        fi
        ;;
    
    "reset")
        check_docker
        echo -e "${YELLOW}⚠️  This will reset everything (clean + rebuild). Continue? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            $0 clean
            $0 rebuild
            $0 up
        else
            echo -e "${BLUE}ℹ️  Reset cancelled${NC}"
        fi
        ;;
    
    *)
        print_usage
        exit 1
        ;;
esac