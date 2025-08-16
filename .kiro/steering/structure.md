# Project Structure

## Monorepo Organization

RepoFlight follows a standard monorepo structure with clear separation of concerns:

```
repoflight/
├── apps/                    # Application entry points
│   └── dashboard/          # Next.js dashboard application
├── services/               # Backend services
│   └── hook-server/        # Express.js webhook server
├── packages/               # Shared libraries
│   ├── agents/            # Scanning agents (license, security)
│   ├── database/          # Prisma schema and database utilities
│   └── shared/            # Shared types and utilities
├── scripts/               # Setup and deployment scripts
├── nginx/                 # Reverse proxy configuration
└── .kiro/                 # Kiro specifications and hooks
```

## Package Naming Convention

All packages use the `@repoflight/` namespace:
- `@repoflight/dashboard` - Frontend application
- `@repoflight/hook-server` - Webhook service
- `@repoflight/database` - Database package
- `@repoflight/shared` - Shared utilities
- `@repoflight/agents` - Scanning agents

## Key Directories

### `/apps/dashboard/`
Next.js application with App Router structure:
- `src/app/` - App Router pages and layouts
- `src/components/` - React components organized by feature
- `src/lib/` - Client-side utilities (API client, WebSocket)

### `/services/hook-server/`
Express.js service:
- `src/routes/` - API route handlers
- `src/services/` - Business logic services
- `src/__tests__/` - Service tests

### `/packages/database/`
Database layer:
- `prisma/` - Schema and migrations
- `src/` - Database utilities and query helpers
- `src/__tests__/` - Database tests

### `/packages/shared/`
Common types and utilities shared across packages

### `/packages/agents/`
Scanning agents for license compliance and security

## Configuration Files

- `turbo.json` - Turborepo pipeline configuration
- `package.json` - Root package with workspace definitions
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment

## Environment Files

- `.env.example` - Template for environment variables
- `.env` - Local development environment
- `.env.docker` - Docker development environment
- `.env.docker.prod` - Docker production environment

## Development Patterns

- Each package has its own `package.json` with specific dependencies
- Shared dependencies are managed at the root level
- TypeScript strict mode is enforced across all packages
- Tests are co-located with source code in `__tests__/` directories
- Components are organized by feature/domain rather than type